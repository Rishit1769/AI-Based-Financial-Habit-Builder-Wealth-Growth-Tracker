const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;
let activeApiKey = null;

const resolveApiKey = () => {
  const raw = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, '');
  return cleaned;
};

const getGeminiModel = () => {
  const apiKey = resolveApiKey();
  if (!model || activeApiKey !== apiKey) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    activeApiKey = apiKey;
  }
  return model;
};

const generateContent = async (prompt) => {
  try {
    const m = getGeminiModel();
    const result = await m.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    const errText = `${err?.message || ''}`;
    if (errText.includes('API_KEY_INVALID') || errText.includes('API Key not found')) {
      const invalidKeyError = new Error('Gemini API key is invalid. Update GEMINI_API_KEY and restart the backend server.');
      invalidKeyError.statusCode = 503;
      throw invalidKeyError;
    }
    throw err;
  }
};

module.exports = { getGeminiModel, generateContent };
