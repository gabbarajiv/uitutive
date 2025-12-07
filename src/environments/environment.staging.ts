export const environment = {
    production: false,
    // Ollama API configuration (for staging, use your staging server)
    ollama: {
        apiUrl: 'http://staging-ollama-server:11434',
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
