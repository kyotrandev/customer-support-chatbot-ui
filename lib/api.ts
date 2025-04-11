type CozeResponse = {
  content?: string;
  error?: string;
};

type CozeConfig = {
  userId?: string,
  conversationId?: string;
};

export async function sendMessageToCoze(
  message: string,
  config: CozeConfig,
  onChunk?: (chunk: string) => void
): Promise<CozeResponse & { conversationId?: string }> {
  try {
    
    const { conversationId } = config;
    // hard code userId for testing
    const userId = "66599eb8982ed93d46fc3dba";

    if (!userId) {
      return { error: "User ID is required" };
    }

    // Sử dụng NextJS API Route làm proxy thay vì gọi trực tiếp đến backend
    const url = "/api/chat-proxy";

    // Prepare request body
    const requestBody = {
      userId,
      message,
      conversationId
    };

    // Gọi API proxy
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log("Response ", response);
    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `API Error: ${response.status} ${response.statusText}`
      };
    }

    // Handle streaming responses
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      let fullContent = "";
      let extractedConversationId = conversationId;

      const reader = response.body?.getReader();
      if (!reader) {
        return { error: "Failed to read response stream" };
      }

      const decoder = new TextDecoder();

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Process each line in the chunk
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data:")) continue;
          
          const dataStr = line.substring(5).trim();
          
          // Skip "[DONE]" message
          if (dataStr === "[DONE]") continue;
          
          try {
            const data = JSON.parse(dataStr);
            
            // Check if it's an error message
            if (data.error) {
              return { error: `API Error: ${data.error.message || JSON.stringify(data.error)}` };
            }
            
            // Handle completion chunks
            if (data.choices && data.choices.length > 0) {
              const delta = data.choices[0].delta;
              
              // If this is a content delta
              if (delta && delta.content) {
                fullContent += delta.content;
                
                // Call the onChunk callback if provided
                if (onChunk && typeof onChunk === "function") {
                  onChunk(delta.content);
                }
              }
            }
          } catch (e) {
            // Silently ignore parsing errors
            console.error("Error parsing chunk:", e);
          }
        }
      }

      return {
        content: fullContent,
        conversationId: extractedConversationId
      };
    } else {
      // Handle JSON response (non-streaming)
      const data = await response.json();
      
      if (data.error) {
        return { error: `API Error: ${data.error.message || JSON.stringify(data.error)}` };
      }
      
      // Extract the assistant's message
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return {
          content: data.choices[0].message.content,
          conversationId: conversationId
        };
      }
      
      return { error: "Unexpected response format" };
    }
  } catch (error) {
    return {
      error: `Failed to send message: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
export async function retrieveUserConversations(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(
      `/api/conversations-proxy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
        }),
      }
    );
    
    const result = await response.json();
    
    //proxy already formats the response
    return result;
  }
  catch (error) {
    return {
      success: false,
      error: `Failed to request conversations: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function retrieveConversationMessages(
  conversationId: string,
  apiKey: string
): Promise<{ success: boolean; messages?: any[]; error?: string }> {
  try {
    const response = await fetch(
      `https://api.coze.cn/v1/conversation/message/list?conversation_id=${conversationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.code === 0 && data.data) {
      return { success: true, messages: data.data };
    } else {
      return { success: false, error: data.msg || "获取会话消息失败" };
    }
  } catch (error) {
    return {
      success: false,
      error: `获取会话消息失败: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
