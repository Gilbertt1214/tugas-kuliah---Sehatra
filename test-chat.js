const { createOpenAI } = require('@ai-sdk/openai');
const { streamText } = require('ai');

const qwenOpenAI = createOpenAI({
  apiKey: process.env.QWEN_API_KEY || process.env.OPENAI_API_KEY || '',
  baseURL: process.env.QWEN_BASE_URL || 'https://api.mulerouter.ai/vendors/openai/v1',
});

async function test() {
  try {
    const result = await streamText({
      model: qwenOpenAI.chat('qwen3.5-flash'), // Using flash
      messages: [{ role: 'user', content: 'Halo' }],
    });
    
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
