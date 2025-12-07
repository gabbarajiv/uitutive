import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { initializeDatabase, setDatabase } from './db/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/api.routes.js';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, express, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// API Routes
app.use(`${config.api.prefix}${config.api.version}`, apiRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize and start server
async function startServer() {
    try {
        // Initialize database
        console.log(`Initializing ${config.db.type} database...`);
        const db = await initializeDatabase();
        await setDatabase(db);
        console.log('Database initialized successfully');

        // Start listening
        const PORT = config.port;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Environment: ${config.nodeEnv}`);
            console.log(`Database: ${config.db.type}`);
            console.log(`Ollama: ${config.ollama.baseUrl}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

startServer();

export default app;
