import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    
    // Prepare payload for backend
    const backendPayload = {
      id: userId
    };
    
    // Call API from NextJS server-side to backend
    const response = await fetch('https://customer-support-chatbot-api.onrender.com/v1/api/conversation/getConversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendPayload)
    });
    
    // Process the response
    const data = await response.json();
    // Map response codes to success or error
    if (data.code === 200) {
      return NextResponse.json({ 
        success: true, 
        data: data.data 
      });
    } else if (data.code === 404) {
      return NextResponse.json({ 
        success: false, 
        error: "ID không tồn tại" 
      }, { status: 404 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Lỗi server" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error proxying to backend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: `Failed to get conversations: ${errorMessage}` 
    }, { status: 500 });
  }
}