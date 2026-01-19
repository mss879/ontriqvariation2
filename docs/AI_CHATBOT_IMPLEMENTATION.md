# AI Chatbot Implementation Guide

This document explains how to implement a fully functional AI chatbot in a Next.js application using the Vercel AI SDK and OpenAI.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           AiChatWidget Component                     │    │
│  │  - State management (messages, loading, error)       │    │
│  │  - User input handling                               │    │
│  │  - Message display with URL parsing                  │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │ POST /api/chat
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Route (Next.js)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              app/api/chat/route.ts                   │    │
│  │  - Receives messages array                           │    │
│  │  - Calls OpenAI via Vercel AI SDK                    │    │
│  │  - Returns JSON response                             │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     OpenAI API                               │
│  - Model: gpt-4o-mini (or gpt-4o)                           │
│  - System prompt defines behavior                            │
│  - Returns generated text                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Required Dependencies

```bash
npm install ai @ai-sdk/openai @ai-sdk/react
```

**Package versions used:**
- `ai`: ^6.0.39
- `@ai-sdk/openai`: ^3.0.12
- `@ai-sdk/react`: ^3.0.41

---

## File Structure

```
app/
├── api/
│   └── chat/
│       └── route.ts      # API endpoint for chat
components/
└── ai-chat-widget.tsx    # Chat UI component
lib/
└── ai-context.ts         # System prompt (knowledge base)
```

---

## Step 1: Environment Variables

Add to `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## Step 2: System Prompt (lib/ai-context.ts)

This file contains the AI's personality, knowledge base, and behavioral rules.

```typescript
export const SYSTEM_PROMPT = `
ROLE AND IDENTITY
- You are [Agent Name], a customer service agent for [Company Name].
- You support prospects, clients, and partners with accurate information.

COMPANY FACTS (SAFE TO STATE)
- List key facts the AI can confidently share
- Services offered
- Key differentiators

HARD RULES
- Never guess or make up information
- Never share sensitive data
- Always provide a next step
- Include contact details when escalation is needed

CONTACT DETAILS
- Website: https://example.com/contact
- Email: info@example.com
- Phone: XXX-XXX-XXXX

FORMATTING
- Use plain text only (no markdown)
- Use simple dash bullets for lists
- Keep responses concise
`;
```

---

## Step 3: API Route (app/api/chat/route.ts)

**Key points:**
- Import `generateText` from `ai` package (NOT `streamText` for simpler implementation)
- Import `openai` from `@ai-sdk/openai`
- Return JSON response with `content` field

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/ai-context';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Format messages for the API
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: typeof msg.content === 'string' ? msg.content : '',
    }));

    // Call OpenAI
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
    });

    // Return response
    return new Response(JSON.stringify({ content: result.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

---

## Step 4: Chat Widget Component

**Key features:**
- Local state for messages, input, loading, and errors
- Fetch API to call the backend
- URL detection and conversion to clickable links
- Styled with Tailwind CSS and Framer Motion

```typescript
"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    setError(null);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedInput,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare API payload
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      // Add assistant message
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content,
      }]);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setIsLoading(false);
    }
  };

  // ... render UI
}
```

---

## Step 5: Add to Layout

In `app/layout.tsx`, import and add the widget:

```typescript
import { AiChatWidget } from "@/components/ai-chat-widget";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <AiChatWidget />
      </body>
    </html>
  );
}
```

---

## Key Learnings and Gotchas

### AI SDK v6 API Changes
- `streamText().toDataStreamResponse()` does NOT work in v6
- Use `generateText()` for simpler non-streaming responses
- Or use `createTextStreamResponse()` for streaming

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `toDataStreamResponse is not a function` | AI SDK v6 API change | Use `generateText()` instead |
| `Unexpected token '<'` | API route missing/deleted | Recreate `app/api/chat/route.ts` |
| `500 Internal Server Error` | Missing API key or bad format | Check `.env.local` and restart server |

### System Prompt Tips
- Be explicit about formatting (no markdown if displaying in plain UI)
- Include escalation rules and contact details
- Define what the AI CAN and CANNOT do clearly
- Use uppercase headers for important sections

---

## Reusable Template Prompt

Copy this to create a new AI chatbot:

```
I want to implement an AI chatbot in my Next.js application with these requirements:

1. Use Vercel AI SDK with OpenAI (gpt-4o-mini model)
2. Create a floating chat widget component in the bottom-right corner
3. Store system prompt in a separate file (lib/ai-context.ts)
4. API route at /api/chat that accepts messages array
5. Use generateText (not streaming) for simpler implementation
6. Automatically convert URLs in responses to clickable links
7. Display loading state while waiting for AI response
8. Handle and display errors gracefully

The chatbot should act as a customer service agent for [COMPANY NAME] with these capabilities:
- Answer questions about [SERVICES/PRODUCTS]
- Provide [SPECIFIC INFO]
- Never make up information, escalate to human when uncertain
- Always end with a next step or contact information

Required dependencies: ai, @ai-sdk/openai, @ai-sdk/react
Environment variable needed: OPENAI_API_KEY
```

---

## Files Created in This Implementation

| File | Purpose |
|------|---------|
| `app/api/chat/route.ts` | API endpoint for chat |
| `components/ai-chat-widget.tsx` | Chat UI component |
| `lib/ai-context.ts` | System prompt and knowledge base |

---

*Last updated: January 18, 2026*
