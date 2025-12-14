import { Injectable } from '@angular/core';

export interface ModelFact {
    model: string;
    facts: string[];
}

@Injectable({
    providedIn: 'root',
})
export class ModelFactsService {
    private readonly modelFacts: Record<string, string[]> = {
        'llama2': [
            '🦙 Llama 2 is an open-source large language model developed by Meta.',
            '⚡ Llama 2 can run efficiently on consumer-grade hardware.',
            '🧠 Llama 2 has been fine-tuned for safety and responsibility.',
            '📚 Llama 2 trained on 2 trillion tokens of data.',
            '🔒 Llama 2 supports context windows up to 4,096 tokens.',
            '🌍 Llama 2 comes in 7B, 13B, and 70B parameter variants.',
            '💪 Llama 2 can handle complex reasoning tasks.',
            '🎯 Llama 2 is optimized for conversational use cases.',
        ],
        'mistral': [
            '🌟 Mistral AI focuses on efficiency and performance.',
            '⚙️ Mistral 7B offers better performance-to-size ratio.',
            '🚀 Mistral uses novel attention mechanisms for speed.',
            '💡 Mistral is designed for real-world production deployments.',
            '🔧 Mistral supports fine-tuning and customization.',
            '📈 Mistral can handle longer context windows efficiently.',
            '🎨 Mistral excels at creative text generation.',
            '🔍 Mistral provides transparent model behavior.',
        ],
        'neural-chat': [
            '💬 Neural Chat is optimized for conversational excellence.',
            '🎭 Neural Chat understands context and nuance in conversations.',
            '🧪 Neural Chat trained on high-quality dialogue data.',
            '📱 Neural Chat is lightweight for mobile deployment.',
            '🌐 Neural Chat supports multiple languages.',
            '🎯 Neural Chat focused on user engagement and satisfaction.',
            '🔐 Neural Chat includes safety mechanisms.',
            '💫 Neural Chat learns conversation patterns effectively.',
        ],
        'openchat': [
            '🤖 OpenChat is a community-driven conversational AI.',
            '📖 OpenChat trained on community conversations and feedback.',
            '🎯 OpenChat focuses on practical and helpful responses.',
            '⚡ OpenChat delivers fast inference times.',
            '🌈 OpenChat supports diverse conversation styles.',
            '🏆 OpenChat wins benchmarks for efficiency.',
            '🔄 OpenChat regularly updated with community insights.',
            '💖 OpenChat designed to be friendly and approachable.',
        ],
        'zephyr': [
            '⚡ Zephyr is a fine-tuned version optimized for speed.',
            '🎓 Zephyr trained using direct preference optimization.',
            '🎯 Zephyr excels at following instructions precisely.',
            '📊 Zephyr performs well on benchmarks for its size.',
            '🔧 Zephyr designed for production environments.',
            '💼 Zephyr suitable for business applications.',
            '🌬️ Zephyr brings a fresh approach to language models.',
            '⭐ Zephyr optimized for quality over quantity.',
        ],
        'orca': [
            '🐋 Orca models focus on deep reasoning and understanding.',
            '🧠 Orca uses chain-of-thought reasoning patterns.',
            '📚 Orca learns from instruction-following examples.',
            '🎯 Orca performs well on complex problem-solving.',
            '🔬 Orca designed for research and advanced tasks.',
            '📈 Orca improves performance through better training.',
            '💡 Orca demonstrates emergent reasoning abilities.',
            '🌟 Orca challenges the idea of bigger-is-better.',
        ],
        'dolphin': [
            '🐬 Dolphin models are uncensored and research-focused.',
            '🔬 Dolphin used extensively in AI research.',
            '📚 Dolphin trained on diverse, unfiltered datasets.',
            '🎨 Dolphin excels at creative and unrestricted tasks.',
            '🧠 Dolphin explores frontier capabilities of language models.',
            '⚙️ Dolphin optimized for experimentation.',
            '🌊 Dolphin models navigate complex instructions smoothly.',
            '🔓 Dolphin provides transparent model behavior.',
        ],
        'default': [
            '🤖 AI models process text through neural networks with billions of parameters.',
            '⚡ Modern language models use transformer architecture for efficiency.',
            '📚 Training data shapes model capabilities and behavior.',
            '🧠 Language models learn patterns from text to predict continuations.',
            '🎯 Model size impacts speed, memory, and accuracy.',
            '🔧 Fine-tuning helps models specialize for specific tasks.',
            '💡 Temperature and sampling control creativity in responses.',
            '🌟 Diverse models enable different trade-offs and specializations.',
        ],
    };

    /**
     * Get a random fact for the specified model
     */
    getRandomFact(modelName: string): string {
        const facts = this.modelFacts[modelName?.toLowerCase()] || this.modelFacts['default'];
        return facts[Math.floor(Math.random() * facts.length)];
    }

    /**
     * Get all facts for the specified model
     */
    getAllFacts(modelName: string): string[] {
        return this.modelFacts[modelName?.toLowerCase()] || this.modelFacts['default'];
    }

    /**
     * Get a specific fact by index
     */
    getFactByIndex(modelName: string, index: number): string {
        const facts = this.modelFacts[modelName?.toLowerCase()] || this.modelFacts['default'];
        return facts[index % facts.length];
    }

    /**
     * Get model display name (for UI purposes)
     */
    getModelDisplayName(modelName: string): string {
        const displayNames: Record<string, string> = {
            'llama2': 'Llama 2',
            'mistral': 'Mistral',
            'neural-chat': 'Neural Chat',
            'openchat': 'OpenChat',
            'zephyr': 'Zephyr',
            'orca': 'Orca',
            'dolphin': 'Dolphin',
        };
        return displayNames[modelName?.toLowerCase()] || modelName;
    }
}
