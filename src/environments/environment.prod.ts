export const environment = {
    production: true,
    // API URL for backend services (update with your production server)
    apiUrl: 'https://your-domain.com/api/v1',
    // Ollama API configuration (for production, use your server URL)
    ollama: {
        apiUrl: 'http://your-ollama-server:11434',
        model: 'llama2',
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
    },
    // OpenAI API for fallback
    openai: {
        apiUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
    },
    apiTimeout: 60000,
};
