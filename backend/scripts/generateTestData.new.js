import { faker } from '@faker-js/faker';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
    totalDocuments: 200, // Increased for better search testing
    batchSize: 10, // Increased batch size for faster processing
    serverUrl: 'http://localhost:4000',
    uploadEndpoint: '/api/v1/upload/file',
    tempDir: path.join(__dirname, 'temp'),
    tags: [
        // Project Management
        'project-planning', 'sprint-review', 'backlog', 'milestones', 'deliverables',
        'timeline', 'roadmap', 'requirements', 'stakeholder-meeting', 'progress-report',

        // Development
        'architecture', 'code-review', 'debugging', 'feature-development', 'testing',
        'deployment', 'ci-cd', 'performance', 'security', 'optimization',
        'api-documentation', 'database-design', 'microservices', 'frontend', 'backend',

        // Documentation
        'technical-spec', 'user-guide', 'api-reference', 'system-design', 'workflow',
        'troubleshooting', 'best-practices', 'release-notes', 'setup-guide',

        // Business
        'market-analysis', 'customer-feedback', 'product-strategy', 'competitive-analysis',
        'user-research', 'analytics', 'metrics', 'roi-analysis', 'budget-planning',

        // Design
        'ui-design', 'ux-research', 'wireframes', 'prototypes', 'design-system',
        'accessibility', 'user-testing', 'style-guide', 'interaction-design',

        // Team
        'onboarding', 'training-material', 'knowledge-base', 'team-meeting',
        'collaboration', 'skills-development', 'workshop', 'brainstorming'
    ]
};

// Create temp directory if it doesn't exist
if (!fs.existsSync(CONFIG.tempDir)) {
    fs.mkdirSync(CONFIG.tempDir, { recursive: true });
}

// Utility Functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateRandomTags = () => {
    const numTags = faker.number.int({ min: 1, max: 3 });
    const tags = new Set();
    while (tags.size < numTags) {
        tags.add(CONFIG.tags[faker.number.int({ min: 0, max: CONFIG.tags.length - 1 })]);
    }
    return Array.from(tags);
};

const generateDocumentContent = () => {
    // Define possible document types and their templates
    const templates = {
        technicalDoc: () => {
            const topic = faker.helpers.arrayElement([
                'API Integration', 'Database Schema', 'System Architecture',
                'Security Protocol', 'Performance Optimization', 'Deployment Process'
            ]);

            const sections = [
                `# ${topic}\n\n`,
                `## Overview\n${faker.company.catchPhrase()}\n\n`,
                `## Background\n${faker.lorem.paragraph()}\n\n`,
                `## Technical Details\n${faker.lorem.paragraphs(3)}\n\n`,
                `### Implementation\n\`\`\`\n${faker.lorem.paragraphs(2)}\n\`\`\`\n\n`,
                `## Recommendations\n${faker.lorem.paragraphs(2)}\n\n`,
                `## Next Steps\n- ${faker.company.buzzPhrase()}\n- ${faker.company.buzzPhrase()}\n- ${faker.company.buzzPhrase()}\n`
            ];
            return sections.join('\n');
        },

        meetingNotes: () => {
            const meetingType = faker.helpers.arrayElement([
                'Sprint Planning', 'Architecture Review', 'Product Demo',
                'Stakeholder Update', 'Technical Discussion', 'Design Review'
            ]);

            const attendees = Array(faker.number.int({ min: 3, max: 6 }))
                .fill()
                .map(() => faker.person.fullName());

            return [
                `# ${meetingType} Meeting Notes\n`,
                `Date: ${faker.date.recent().toISOString().split('T')[0]}`,
                `\n## Attendees\n${attendees.map(a => `- ${a}`).join('\n')}\n`,
                `\n## Agenda\n${faker.lorem.paragraphs(1)}\n`,
                `\n## Discussion Points\n${faker.lorem.paragraphs(3)}\n`,
                `\n## Action Items\n${Array(3).fill().map(() => `- ${faker.company.buzzPhrase()}`).join('\n')}\n`,
                `\n## Next Steps\n${faker.lorem.paragraphs(1)}`
            ].join('\n');
        },

        projectReport: () => {
            const project = faker.company.catchPhrase();
            const status = faker.helpers.arrayElement(['On Track', 'At Risk', 'Completed', 'In Progress']);

            return [
                `# ${project} - Project Status Report\n`,
                `## Executive Summary\n${faker.lorem.paragraph()}\n`,
                `\n## Project Status: ${status}\n${faker.lorem.paragraph()}\n`,
                `\n## Key Achievements\n${Array(3).fill().map(() => `- ${faker.company.buzzPhrase()}`).join('\n')}\n`,
                `\n## Challenges\n${faker.lorem.paragraphs(2)}\n`,
                `\n## Risk Analysis\n${faker.lorem.paragraphs(2)}\n`,
                `\n## Budget Summary\n${faker.lorem.paragraph()}\n`,
                `\n## Timeline\n${faker.lorem.paragraphs(1)}\n`
            ].join('\n');
        },

        researchDoc: () => {
            const topic = faker.helpers.arrayElement([
                'Market Analysis', 'Technology Trends', 'User Research',
                'Competitive Analysis', 'Performance Study', 'Security Assessment'
            ]);

            return [
                `# ${topic} Research Document\n`,
                `## Executive Summary\n${faker.lorem.paragraphs(2)}\n`,
                `\n## Methodology\n${faker.lorem.paragraphs(2)}\n`,
                `\n## Key Findings\n${Array(4).fill().map(() => `- ${faker.company.buzzPhrase()}`).join('\n')}\n`,
                `\n## Detailed Analysis\n${faker.lorem.paragraphs(3)}\n`,
                `\n## Recommendations\n${faker.lorem.paragraphs(2)}\n`,
                `\n## References\n${Array(3).fill().map(() => `- ${faker.company.catchPhrase()}`).join('\n')}\n`
            ].join('\n');
        }
    };

    // Select a random template and generate content
    const templateTypes = Object.keys(templates);
    const selectedType = faker.helpers.arrayElement(templateTypes);
    return {
        content: templates[selectedType](),
        documentType: selectedType
    };
};

const generateTestFile = async () => {
    try {
        // Generate content using templates
        const { content, documentType } = generateDocumentContent();
        const fileName = `${faker.string.alphanumeric(10)}.md`;
        const filePath = path.join(CONFIG.tempDir, fileName);

        // Write content to file
        await fs.promises.writeFile(filePath, content);

        // Generate metadata with context-aware title and description
        const metadata = {
            title: content.split('\n')[0].replace('# ', ''),
            description: content.split('\n')[2] || faker.lorem.paragraph(),
            tags: JSON.stringify(generateRandomTags()),
            type: 'document'
        };

        return { filePath, fileName, metadata };
    } catch (error) {
        console.error('Error generating test file:', error);
        throw error;
    }
};

const uploadFile = async (filePath, fileName, metadata) => {
    try {
        const formData = new FormData();

        // Append file
        formData.append('file', fs.createReadStream(filePath), {
            filename: fileName,
            contentType: 'text/plain'
        });

        // Append metadata
        Object.entries(metadata).forEach(([key, value]) => {
            formData.append(key, value);
        });

        console.log(`📤 Uploading ${fileName}...`);
        const response = await axios.post(
            `${CONFIG.serverUrl}${CONFIG.uploadEndpoint}`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        );

        console.log(`✅ Successfully uploaded ${fileName}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error uploading ${fileName}:`, error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

const cleanup = async () => {
    try {
        const files = await fs.promises.readdir(CONFIG.tempDir);
        await Promise.all(
            files.map(file =>
                fs.promises.unlink(path.join(CONFIG.tempDir, file))
            )
        );
        await fs.promises.rmdir(CONFIG.tempDir);
        console.log('🧹 Cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
};

// Main execution
const main = async () => {
    console.log('🚀 Starting test data generation...');

    try {
        // Check server availability
        console.log('🔍 Checking server availability...');
        try {
            await axios.get(`${CONFIG.serverUrl}/health`);
            console.log('✅ Server is available');
        } catch (error) {
            console.error('❌ Server is not available:', error.message);
            console.log('\n⚠️  Please ensure:');
            console.log('1. The backend server is running');
            console.log('2. The server is accessible at', CONFIG.serverUrl);
            console.log('3. The /health endpoint is available');
            process.exit(1);
        }

        let successCount = 0;
        let failureCount = 0;

        // Process in batches
        for (let i = 0; i < CONFIG.totalDocuments; i += CONFIG.batchSize) {
            const batchSize = Math.min(CONFIG.batchSize, CONFIG.totalDocuments - i);
            console.log(`\n📦 Processing batch ${(i / CONFIG.batchSize) + 1}...`);

            const batchPromises = Array(batchSize).fill().map(async () => {
                try {
                    const { filePath, fileName, metadata } = await generateTestFile();
                    const result = await uploadFile(filePath, fileName, metadata);
                    successCount++;
                    return result;
                } catch (error) {
                    failureCount++;
                    return null;
                }
            });

            await Promise.all(batchPromises);

            // Add a small delay between batches
            if (i + CONFIG.batchSize < CONFIG.totalDocuments) {
                await sleep(1000);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successful uploads: ${successCount}`);
        console.log(`❌ Failed uploads: ${failureCount}`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await cleanup();
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n🛑 Interrupted by user');
    await cleanup();
    process.exit(0);
});

// Start execution
main().catch(async (error) => {
    console.error('❌ Unhandled error:', error);
    await cleanup();
    process.exit(1);
});