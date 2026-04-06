const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

const getGeminiModel = () => {
  if (!model) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
};

const generateContent = async (prompt) => {
  const m = getGeminiModel();
  const result = await m.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

module.exports = { getGeminiModel, generateContent };
