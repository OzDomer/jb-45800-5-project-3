import config from "config";
import OpenAI from "openai";

const apiKey = config.get<string>("openai.apiKey");

if (!apiKey) {
    console.log("openai api key is missing - AI features are disabled. Set the VACATIONS_OPENAI_API_KEY env var");
}

export function isAiConfigured(): boolean {
    return !!apiKey;
}

const openai = new OpenAI({
    apiKey: apiKey || 'missing-api-key',
});

export default openai