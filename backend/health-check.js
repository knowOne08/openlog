#!/usr/bin/env node

import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const services = [
    {
        name: 'Docker',
        check: () => execAsync('docker info'),
        required: true
    },
    {
        name: 'MinIO',
        check: () => fetch('http://localhost:9000/minio/health/live'),
        url: 'http://localhost:9001',
        required: true
    },
    {
        name: 'MeiliSearch', 
        check: () => fetch('http://localhost:7700/health'),
        url: 'http://localhost:7700',
        required: true
    },
    {
        name: 'Backend Server',
        check: () => fetch('http://localhost:3001/api/health').catch(() => fetch('http://localhost:3000/api/health')),
        url: 'http://localhost:3001',
        required: false
    }
];

async function checkService(service) {
    try {
        const result = await service.check();
        if (result && (result.ok || result.stdout !== undefined)) {
            return { name: service.name, status: 'healthy', url: service.url };
        }
        return { name: service.name, status: 'unhealthy', url: service.url };
    } catch (error) {
        return { name: service.name, status: 'down', error: error.message, url: service.url };
    }
}

async function main() {
    console.log('🔍 OpenLog Health Check\n');
    console.log('═'.repeat(50));
    
    const results = await Promise.all(services.map(checkService));
    
    let allHealthy = true;
    let requiredDown = false;
    
    for (const result of results) {
        const service = services.find(s => s.name === result.name);
        const icon = result.status === 'healthy' ? '✅' : result.status === 'unhealthy' ? '⚠️' : '❌';
        const status = result.status.toUpperCase();
        
        console.log(`${icon} ${result.name.padEnd(15)} ${status}`);
        
        if (result.url) {
            console.log(`   └─ ${result.url}`);
        }
        
        if (result.error) {
            console.log(`   └─ Error: ${result.error}`);
        }
        
        if (result.status !== 'healthy') {
            allHealthy = false;
            if (service.required) {
                requiredDown = true;
            }
        }
        
        console.log('');
    }
    
    console.log('═'.repeat(50));
    
    if (allHealthy) {
        console.log('🎉 All services are healthy!');
        process.exit(0);
    } else if (requiredDown) {
        console.log('🚨 Required services are down. Please start them:');
        console.log('   npm run services:start');
        process.exit(1);
    } else {
        console.log('⚠️  Some optional services are down, but core services are running.');
        process.exit(0);
    }
}

main().catch(error => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
});
