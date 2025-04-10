// app/api/chat-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, message, conversationId } = body;
    
    // Chuẩn bị payload cho backend
    const backendPayload = {
      id: userId,
      conversation_id: conversationId,
      query: message
    };
    
    // Gọi API từ server-side NextJS đến backend
    const response = await fetch('https://customer-support-chatbot-api.onrender.com/v1/api/conversation/streamChat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendPayload)
    });

    // Xử lý streaming
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/event-stream')) {
      // Trong App Router, xử lý streaming hơi khác
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      // Xử lý response JSON`
      const data = await response.json();
      console.log('Response from backend:', data);
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error proxying to backend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', message: errorMessage }, { status: 500 });
  }
}