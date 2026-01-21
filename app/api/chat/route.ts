import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/ai-context';
import { rateLimit } from '@/lib/rate-limit';

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Rate limiter: 5 requests per minute per IP
const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 unique IPs per minute
});

export async function POST(req: Request) {
    console.log('=== Chat API called ===');

    try {
        // 1. Rate Limiting Strategy
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const token = ip; // Use IP as the unique token

        try {
            await limiter.check(5, token); // 5 requests per minute
        } catch {
            console.warn(`Rate limit exceeded for IP: ${ip}`);
            return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error('OPENAI_API_KEY is not set');
            return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages array is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Convert messages to simple format
        const formattedMessages = messages.map((msg: { role: string; content: string; parts?: Array<{ type: string; text?: string }> }) => {
            let content = '';

            if (msg.parts && Array.isArray(msg.parts)) {
                content = msg.parts
                    .filter((part) => part.type === 'text' && part.text)
                    .map((part) => part.text)
                    .join('');
            } else if (typeof msg.content === 'string') {
                content = msg.content;
            }

            return {
                role: msg.role as 'user' | 'assistant' | 'system',
                content: content,
            };
        });

        console.log('Calling OpenAI with generateText...');

        // Use generateText instead of streamText for simpler implementation
        const result = await generateText({
            model: openai('gpt-4o-mini'),
            system: SYSTEM_PROMPT,
            messages: formattedMessages,
        });

        console.log('OpenAI response received, length:', result.text.length);

        // Return the text as a simple JSON response
        return new Response(JSON.stringify({
            content: result.text
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('=== Chat API Error ===');
        console.error('Error:', error instanceof Error ? error.message : String(error));
        console.error('Stack:', error instanceof Error ? error.stack : 'no stack');

        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: 'An unexpected error occurred. Please try again later.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
