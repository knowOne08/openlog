# Client examples for MinIO Microservice

This directory contains example clients for different programming languages and frameworks.

## JavaScript/Node.js Client

```javascript
class MinioClient {
    constructor(baseUrl = 'http://localhost:3001') {
        this.baseUrl = baseUrl;
    }

    async uploadFile(file, customName = null, metadata = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        if (customName) {
            formData.append('customName', customName);
        }
        
        if (Object.keys(metadata).length > 0) {
            formData.append('metadata', JSON.stringify(metadata));
        }

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData
        });

        return response.json();
    }

    async getFileUrl(objectName, expiry = 3600) {
        const response = await fetch(`${this.baseUrl}/file/${objectName}/url?expiry=${expiry}`);
        return response.json();
    }

    async downloadFile(objectName) {
        const response = await fetch(`${this.baseUrl}/file/${objectName}/download`);
        return response.blob();
    }

    async deleteFile(objectName) {
        const response = await fetch(`${this.baseUrl}/file/${objectName}`, {
            method: 'DELETE'
        });
        return response.json();
    }

    async listFiles(prefix = '', limit = 100) {
        const response = await fetch(`${this.baseUrl}/files?prefix=${prefix}&limit=${limit}`);
        return response.json();
    }

    async getHealth() {
        const response = await fetch(`${this.baseUrl}/health`);
        return response.json();
    }
}

// Usage example
const client = new MinioClient();

// Upload a file
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];
const result = await client.uploadFile(file, 'my-file.pdf', { category: 'documents' });
console.log('Upload result:', result);

// Get download URL
const urlResult = await client.getFileUrl(result.data.objectName);
console.log('Download URL:', urlResult.data.downloadUrl);
```

## Python Client

```python
import requests
import json

class MinioClient:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url

    def upload_file(self, file_path, custom_name=None, metadata=None):
        url = f"{self.base_url}/upload"
        
        with open(file_path, 'rb') as file:
            files = {'file': file}
            data = {}
            
            if custom_name:
                data['customName'] = custom_name
            
            if metadata:
                data['metadata'] = json.dumps(metadata)
            
            response = requests.post(url, files=files, data=data)
            return response.json()

    def get_file_url(self, object_name, expiry=3600):
        url = f"{self.base_url}/file/{object_name}/url"
        params = {'expiry': expiry}
        response = requests.get(url, params=params)
        return response.json()

    def download_file(self, object_name, save_path):
        url = f"{self.base_url}/file/{object_name}/download"
        response = requests.get(url)
        
        with open(save_path, 'wb') as file:
            file.write(response.content)
        
        return True

    def delete_file(self, object_name):
        url = f"{self.base_url}/file/{object_name}"
        response = requests.delete(url)
        return response.json()

    def list_files(self, prefix="", limit=100):
        url = f"{self.base_url}/files"
        params = {'prefix': prefix, 'limit': limit}
        response = requests.get(url, params=params)
        return response.json()

    def get_health(self):
        url = f"{self.base_url}/health"
        response = requests.get(url)
        return response.json()

# Usage example
client = MinioClient()

# Upload a file
result = client.upload_file("./example.pdf", "my-document.pdf", {"category": "documents"})
print("Upload result:", result)

# Get download URL
url_result = client.get_file_url(result['data']['objectName'])
print("Download URL:", url_result['data']['downloadUrl'])
```

## React Component Example

```jsx
import React, { useState } from 'react';

const FileUploader = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify({
            uploadedAt: new Date().toISOString(),
            originalName: file.name
        }));

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            setResult(result);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
            
            {result && (
                <div>
                    <h3>Upload Successful!</h3>
                    <p>Object Name: {result.data.objectName}</p>
                    <a href={result.data.downloadUrl} target="_blank" rel="noopener noreferrer">
                        Download File
                    </a>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
```

## curl Examples

```bash
# Upload a file
curl -X POST http://localhost:3001/upload \
  -F "file=@example.pdf" \
  -F "customName=my-document.pdf" \
  -F "metadata={\"category\":\"documents\"}"

# Get file URL
curl "http://localhost:3001/file/my-document.pdf/url?expiry=7200"

# Download file
curl "http://localhost:3001/file/my-document.pdf/download" -o downloaded.pdf

# List files
curl "http://localhost:3001/files?limit=10"

# Delete file
curl -X DELETE "http://localhost:3001/file/my-document.pdf"

# Health check
curl "http://localhost:3001/health"
```
