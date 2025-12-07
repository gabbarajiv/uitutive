export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database Configuration
    db: {
        type: process.env.DB_TYPE || 'sqlite', // 'sqlite' or 'postgres'
        // SQLite options
        sqlite: {
            path: process.env.SQLITE_PATH || './data/uitutive.db'
        },
        // PostgreSQL options
        postgres: {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'password',
            database: process.env.POSTGRES_DB || 'uitutive'
        }
    },

    // Ollama Configuration
    ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama2',
        timeout: parseInt(process.env.OLLAMA_TIMEOUT || '120000', 10)  // 2 minutes for model inference
    },

    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
        credentials: true
    },

    // API Configuration
    api: {
        prefix: '/api',
        version: '/v1'
    }
};
