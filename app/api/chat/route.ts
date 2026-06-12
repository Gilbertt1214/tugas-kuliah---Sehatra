// Chatbot AI Qwen - Raw Fetch Streaming (Plain Text Stream)
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.QWEN_API_KEY || process.env.OPENAI_API_KEY || '';
  const baseUrl = process.env.QWEN_BASE_URL || 'https://api.mulerouter.ai/vendors/openai/v1';

  const systemMessage = {
    role: 'system',
    content: "Kamu adalah Asisten AI Sehatra. Kamu didukung oleh model Qwen. Kamu selalu menjawab pertanyaan seputar kesehatan dengan ramah, berempati, dan rapih. Berikan saran pencegahan dan gaya hidup sehat, namun selalu ingatkan pengguna bahwa kamu bukan pengganti diagnosis medis dari dokter sungguhan. Jawab langsung dan ringkas."
  };

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen3.5-plus',
        messages: [systemMessage, ...messages],
        stream: true,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API upstream error:', response.status, errorText);
      return new Response(JSON.stringify({ error: errorText }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Stream teks murni ke frontend
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            // Hanya kirim content (jawaban), abaikan reasoning_content (proses berpikir)
            const content = delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch {
            // Skip
          }
        }
      }
    });

    return new Response(response.body!.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Gagal menghubungi AI' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
