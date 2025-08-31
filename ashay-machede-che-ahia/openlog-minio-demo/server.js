const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const { MeiliSearch } = require("meilisearch");
const { QdrantClient } = require("@qdrant/qdrant-js");
const cors = require("cors");

// --- AI Model Setup ---
let modelPipeline;
const loadModel = async () => {
    try {
        const { pipeline } = await import('@xenova/transformers');
        modelPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log("AI model for vector embeddings loaded successfully.");
    } catch (error) {
        console.error("Failed to load AI model:", error);
        process.exit(1); // Exit if the model can't be loaded
    }
};

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

// --- Service Configurations ---
const supabase = createClient("https://qikrxnrrjejfusggtfae.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpa3J4bnJyamVqZnVzZ2d0ZmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODIwNTgsImV4cCI6MjA3MjA1ODA1OH0.vs9E_lA8BdOtLmS0Q5IAcpGCDtKFIYPJWocT0OL3iVY");
const s3 = new AWS.S3({ endpoint: "http://127.0.0.1:9000", accessKeyId: "minioadmin", secretAccessKey: "minioadmin", s3ForcePathStyle: true, signatureVersion: "v4" });
const meiliClient = new MeiliSearch({ host: 'http://127.0.0.1:7700', apiKey: 'aVeryLongAndRandomMasterKey' });
const qdrantClient = new QdrantClient({ url: 'http://127.0.0.1:6333' });

const QDRANT_COLLECTION_NAME = "entries";

const ensureQdrantCollection = async () => {
    try {
        const collections = await qdrantClient.getCollections();
        if (!collections.collections.some(c => c.name === QDRANT_COLLECTION_NAME)) {
            await qdrantClient.createCollection(QDRANT_COLLECTION_NAME, {
                vectors: { size: 384, distance: 'Cosine' },
            });
            console.log(`Qdrant collection '${QDRANT_COLLECTION_NAME}' created.`);
        }
    } catch (error) {
        console.error("Error ensuring Qdrant collection:", error);
    }
};

// --- API ENDPOINTS ---

app.post("/add-test-entry", async (req, res) => {
    const testEntryData = {
        title: 'Automotive Powerplant Analysis', description: 'A detailed report on the performance of an internal combustion motor.',
        uploader_name: 'Test System', entry_type: 'link', external_url: '#test-entry',
        created_at: new Date().toISOString(), tags: ['test-case', 'semantic-only']
    };
    try {
        const { data: supabaseData, error } = await supabase.from("entries").insert(testEntryData).select().single();
        if (error) throw error;
        testEntryData.id = supabaseData.id;

        await meiliClient.index('entries').addDocuments([testEntryData]);
        
        const textToEmbed = `${testEntryData.title}. ${testEntryData.description}`;
        const embedding = await modelPipeline(textToEmbed, { pooling: 'mean', normalize: true });
        await qdrantClient.upsert(QDRANT_COLLECTION_NAME, {
            wait: true,
            points: [{ id: testEntryData.id, vector: Array.from(embedding.data), payload: { supabase_id: testEntryData.id } }]
        });
        
        console.log(`Test entry ${testEntryData.id} created and indexed in both Meilisearch and Qdrant.`);
        res.status(200).send({ message: "Semantic search test entry created successfully." });
    } catch (error) {
        console.error("Error creating test entry:", error);
        res.status(500).json({ message: "Failed to create test entry.", error: error.message });
    }
});

app.post("/entry", upload.single("file"), async (req, res) => {
    let newEntryData;
    try {
        if (req.file) {
            const fileContent = fs.readFileSync(req.file.path);
            await s3.upload({ Bucket: "openlog", Key: req.file.originalname, Body: fileContent }).promise();
            newEntryData = {
                title: req.body.title, description: req.body.description, uploader_name: req.body.uploader_name,
                entry_type: 'file', storage_key: req.file.originalname, created_at: new Date().toISOString(), tags: []
            };
        } else if (req.body.external_url) {
            newEntryData = {
                title: req.body.title, description: req.body.description, uploader_name: req.body.uploader_name,
                entry_type: 'link', external_url: req.body.external_url, created_at: new Date().toISOString(), tags: []
            };
        } else {
            return res.status(400).send("Bad Request.");
        }

        const { data: supabaseData, error } = await supabase.from("entries").insert(newEntryData).select().single();
        if (error) throw error;
        newEntryData.id = supabaseData.id;

        await meiliClient.index('entries').addDocuments([newEntryData]);
        
        const textToEmbed = `${newEntryData.title}. ${newEntryData.description}`;
        const embedding = await modelPipeline(textToEmbed, { pooling: 'mean', normalize: true });
        await qdrantClient.upsert(QDRANT_COLLECTION_NAME, {
            wait: true,
            points: [{ id: newEntryData.id, vector: Array.from(embedding.data), payload: { supabase_id: newEntryData.id } }]
        });
        
        console.log(`Entry ${newEntryData.id} created and indexed.`);
        res.status(200).send({ message: "Entry created successfully." });

    } catch (error) {
        console.error("Error creating entry:", error);
        res.status(500).json({ message: "Failed to create entry.", error: error.message });
    }
});

app.get("/search", async (req, res) => {
    const { q: query, smart } = req.query;
    if (!query) return res.status(400).send("Query required.");

    try {
        const meiliResults = await meiliClient.index('entries').search(query);
        let finalHits = meiliResults.hits;
        let smartHits = [];

        if (smart === 'true') {
            console.log("Smart search enabled! Querying Qdrant...");
            const queryVector = await modelPipeline(query, { pooling: 'mean', normalize: true });
            
            const qdrantResults = await qdrantClient.search(QDRANT_COLLECTION_NAME, {
                vector: Array.from(queryVector.data),
                limit: 5,
                score_threshold: 0.6,
            });
            
            console.log("Qdrant results (before fetching from Supabase):", qdrantResults);

            const qdrantSupabaseIds = qdrantResults.map(result => result.id);

            if (qdrantSupabaseIds.length > 0) {
                const { data, error } = await supabase.from('entries').select('*').in('id', qdrantSupabaseIds);
                if (error) throw error;
                smartHits = data;
            }
        }

        const allHits = [...finalHits, ...smartHits];
        const uniqueHits = Array.from(new Map(allHits.map(item => [item.id, item])).values());
        res.status(200).send(uniqueHits);

    } catch (error) {
        if (error.cause?.code === 'index_not_found') return res.status(200).send([]);
        console.error("Search Error:", error);
        res.status(500).send("Error performing search.");
    }
});

// CURATED: Restored full logic for the DELETE endpoint.
app.delete("/entry/:id", async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) return res.status(400).json({ message: "Invalid ID provided." });
    
    try {
        const { data: entry, error: fetchError } = await supabase.from('entries').select('entry_type, storage_key').eq('id', id).single();
        if (fetchError) throw new Error(`Could not find entry in Supabase: ${fetchError.message}`);

        if (entry.entry_type === 'file' && entry.storage_key) {
            await s3.deleteObject({ Bucket: 'openlog', Key: entry.storage_key }).promise();
            console.log(`Deleted file ${entry.storage_key} from MinIO.`);
        }

        await qdrantClient.delete(QDRANT_COLLECTION_NAME, { points: [parseInt(id)] });
        console.log(`Deleted vector ${id} from Qdrant.`);

        await meiliClient.index('entries').deleteDocument(id);
        console.log(`Deleted document ${id} from Meilisearch.`);
        
        const { error: deleteError } = await supabase.from('entries').delete().eq('id', id);
        if (deleteError) throw new Error(`Supabase delete failed: ${deleteError.message}`);

        res.status(200).json({ message: `Entry ${id} successfully deleted from all services.` });
    } catch (error) {
        console.error(`Failed to delete entry ${id}:`, error);
        res.status(500).json({ message: `Failed to delete entry.`, error: error.message });
    }
});

// CURATED: Restored full logic for the DOWNLOAD endpoint.
app.get("/download/:filename", (req, res) => {
    const params = { Bucket: "openlog", Key: req.params.filename };
    s3.getObject(params, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(404).send("File not found");
        }
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.filename}`);
        res.send(data.Body);
    });
});

// --- Server Startup ---
const startServer = async () => {
    await loadModel();
    await ensureQdrantCollection();
    app.listen(3000, () => console.log("Server running on http://localhost:3000 with AI model loaded."));
};

startServer();