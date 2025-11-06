#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HEALTH_CHECK_TIMEOUT = 60000; // 60 seconds
const HEALTH_CHECK_INTERVAL = 2000; // 2 seconds

async function checkDockerRunning() {
    try {
        await execAsync('docker info');
        return true;
    } catch (error) {
        return false;
    }
}

async function startServices() {
    console.log('🚀 Starting OpenLog Production Services...\n');
    
    // Check if Docker is running
    console.log('🔍 Checking Docker status...');
    const dockerRunning = await checkDockerRunning();
    if (!dockerRunning) {
        console.error('❌ Docker is not running. Please start Docker first.');
        process.exit(1);
    }
    console.log('✅ Docker is running\n');

    // Start Docker services
    console.log('🐳 Starting MinIO and MeiliSearch containers...');
    try {
        const minioDir = join(__dirname, 'minio');
        await execAsync('docker-compose up -d', { cwd: minioDir });
        console.log('✅ Docker services started\n');
    } catch (error) {
        console.error('❌ Failed to start Docker services:', error.message);
        process.exit(1);
    }

    // Wait for services to be healthy
    await waitForServices();
}

async function waitForServices() {
    console.log('⏳ Waiting for services to be ready...\n');
    
    const services = [
        { name: 'MinIO', url: 'http://localhost:9000/minio/health/live' },
        { name: 'MeiliSearch', url: 'http://localhost:7700/health' }
    ];

    for (const service of services) {
        console.log(`🔍 Checking ${service.name}...`);
        const isReady = await waitForService(service.url, service.name);
        if (isReady) {
            console.log(`✅ ${service.name} is ready`);
        } else {
            console.log(`⚠️  ${service.name} might still be starting up`);
        }
    }
    console.log('');
}

async function waitForService(url, serviceName) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < HEALTH_CHECK_TIMEOUT) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return true;
            }
        } catch (error) {
            // Service not ready yet, continue waiting
        }
        
        await new Promise(resolve => setTimeout(resolve, HEALTH_CHECK_INTERVAL));
    }
    
    return false;
}

async function startBackend() {
    console.log('🎯 Starting OpenLog Backend Server...\n');
    
    // Set environment to production
    const env = { ...process.env, NODE_ENV: 'production' };
    
    // Start the backend server
    const backend = spawn('node', ['server.js'], {
        cwd: __dirname,
        env,
        stdio: 'inherit'
    });

    // Handle process termination
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down gracefully...');
        backend.kill('SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down...');
        backend.kill('SIGTERM');
        process.exit(0);
    });

    backend.on('exit', (code) => {
        console.log(`\n📊 Backend server exited with code ${code}`);
        process.exit(code);
    });
}

async function main() {
    try {
        await startServices();
        await startBackend();
    } catch (error) {
        console.error('❌ Startup failed:', error.message);
        process.exit(1);
    }
}

// Only run if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}

export { startServices, startBackend };
