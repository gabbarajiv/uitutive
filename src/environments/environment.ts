// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
    production: false,
    // Ollama local API configuration
    ollama: {
        apiUrl: 'http://localhost:11434',
        model: 'llama2',
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
    },
    // Optional: OpenAI API for fallback (if needed)
    openai: {
        apiUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
    },
    // API timeout in milliseconds
    apiTimeout: 60000,
};
