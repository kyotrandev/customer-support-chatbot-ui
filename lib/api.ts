/* eslint-disable @typescript-eslint/no-explicit-any */
// Interface cho response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

/**
 * Đăng nhập
 */
export async function login(
  username: string,
  password: string
): Promise<ApiResponse<any>> {
  try {
    if (!username || !password) {
      return { success: false, error: "Username và password là bắt buộc" };
    }

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.message || "Đăng nhập thất bại" };
  } catch (error) {
    console.error("Login API error:", error);
    return {
      success: false,
      error: `Lỗi khi đăng nhập: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Đăng xuất
 */
export async function logout(): Promise<ApiResponse<any>> {
  try {
    localStorage.clear();
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.message || "Đăng xuất thất bại" };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi đăng xuất: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Đăng ký
 */
export async function signUp(
  username: string,
  email: string,
  password: string
): Promise<ApiResponse<any>> {
  try {
    if (!username || !email || !password) {
      return {
        success: false,
        error: "Username, email và password là bắt buộc",
      };
    }
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.message || "Đăng ký thất bại" };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi đăng ký: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Làm mới token
 */
export async function refreshToken(
  refreshToken: string
): Promise<ApiResponse<{ accessToken: string }>> {
  try {
    if (!refreshToken) {
      return { success: false, error: "Refresh token là bắt buộc" };
    }
    const response = await fetch("/api/auth/refreshToken", {
      method: "GET",
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data: { accessToken: data.accessToken } };
    }
    return { success: false, error: data.message || "Làm mới token thất bại" };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi làm mới token: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Xác thực token
 */
export async function authenticate(
  accessToken: string
): Promise<ApiResponse<any>> {
  try {
    if (!accessToken) {
      return { success: false, error: "Access token là bắt buộc" };
    }
    const response = await fetch("/api/auth/authenticate", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.message || "Xác thực thất bại" };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi xác thực: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Gửi OTP để đăng kí tài khoản
 */
export async function sendOTP(email: string): Promise<ApiResponse<any>> {
  try {
    if (!email) {
      return { success: false, error: "Email là bắt buộc" };
    }
    const response = await fetch("/api/auth/sendOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.message || "Gửi OTP thất bại" };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi gửi OTP: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Xác thực OTP
 */
export async function verifyOTP(
  email: string,
  otp: string
): Promise<ApiResponse<any>> {
  try {
    if (!email || !otp) {
      return { success: false, error: "Email và OTP là bắt buộc" };
    }
    const response = await fetch("/api/auth/verifyOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.message || "Xác thực OTP thất bại" };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi xác thực OTP: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Reset mật khẩu
 */
export async function resetPassword(
  email: string,
  newPassword: string
): Promise<ApiResponse<any>> {
  try {
    if (!email || !newPassword) {
      return { success: false, error: "Email và mật khẩu mới là bắt buộc" };
    }
    const response = await fetch("/api/auth/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.message || "Reset mật khẩu thất bại" };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi reset mật khẩu: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Gửi OTP để reset mật khẩu
 */
export async function resetPasswordGetOTP(
  email: string
): Promise<ApiResponse<any>> {
  try {
    if (!email) {
      return { success: false, error: "Email là bắt buộc" };
    }
    const response = await fetch(`${baseUrl}/api/auth/getOTP`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (response.ok && data.message === "Đã gửi mã OTP thành công") {
      return { success: true, data };
    }
    return {
      success: false,
      error: data.message || "Gửi OTP reset mật khẩu thất bại",
    };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi gửi OTP reset mật khẩu: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 *  Đổi mật khẩu
 */
export async function changePassword(
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse<any>> {
  try {
    if (!email || !oldPassword || !newPassword) {
      return {
        success: false,
        error: "Email, Password, newPassword là bắt buộc",
      };
    }
    const response = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, oldPassword, newPassword }),
    });
    const data = await response.json();
    if (response.ok && data.message === "Đổi mật khẩu thành công") {
      return { success: true, data };
    }
    return { success: false, error: data.message || "Đổi mật khẩu thất bại" };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi gửi đổi mật khẩu: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Lấy thông tin tài khoản
 */
export async function getAccountInfo(
  username: string
): Promise<ApiResponse<any>> {
  try {
    if (!username) {
      return { success: false, error: "Username là bắt buộc" };
    }
    const response = await fetch("/api/auth/getInfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return {
      success: false,
      error: data.message || "Lấy thông tin tài khoản thất bại",
    };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi lấy thông tin tài khoản: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Cập nhật thông tin tài khoản
 */
export async function updateAccountInfo(info: {
  username: string;
  name?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
}): Promise<ApiResponse<any>> {
  try {
    if (!info.username) {
      return { success: false, error: "Username là bắt buộc" };
    }
    const response = await fetch("/api/auth/updateInfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    }
    return {
      success: false,
      error: data.message || "Cập nhật thông tin tài khoản thất bại",
    };
  } catch (error) {
    return {
      success: false,
      error: `Lỗi khi cập nhật thông tin tài khoản: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
type CozeResponse = {
  content?: string;
  error?: string;
  followUpMessages?: any[];
};

type CozeConfig = {
  userId?: string;
  conversationId?: string;
};

export async function initConversation(
  userId: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    const response = await fetch(`/api/chat/conversations-init-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
      }),
    });

    const result = await response.json();

    //proxy already formats the response
    return result;
  } catch (error) {
    return {
      success: false,
      error: `Failed to request conversations: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function sendMessageToCoze(
  message: string,
  id: string,
  config: CozeConfig,
  onChunk?: (chunk: string) => void
): Promise<CozeResponse & { conversationId?: string }> {
  try {
    const { conversationId } = config;
    // hard code userId for testing
    let userId = id;

    if (!userId) {
      userId = "66599eb8982ed93d46fc3dba"
    }

    // Sử dụng NextJS API Route làm proxy thay vì gọi trực tiếp đến backend
    const url = "/api/chat/chat-proxy";

    // Prepare request body
    const requestBody = {
      userId,
      message,
      conversationId,
    };

    // Gọi API proxy
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response ", response);
    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `API Error: ${response.status} ${response.statusText}`,
      };
    }

    // Handle streaming responses
    if (response.headers.get("content-type")?.includes("text/event-stream")) {
      let fullContent = "";
      let extractedConversationId = conversationId;
      let followUpMessages: any[] = [];
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
              return {
                error: `API Error: ${
                  data.error.message || JSON.stringify(data.error)
                }`,
              };
            }
            // Handle follow-up messages
            if (
              data.follow_up_messages &&
              Array.isArray(data.follow_up_messages)
            ) {
              followUpMessages = data.follow_up_messages;
              continue;
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
        followUpMessages: followUpMessages,
        conversationId: extractedConversationId,
      };
    } else {
      // Handle JSON response (non-streaming)
      const data = await response.json();

      if (data.error) {
        return {
          error: `API Error: ${
            data.error.message || JSON.stringify(data.error)
          }`,
        };
      }

      const followUpMessages = data.messages?.filter(
        (msg: any) => msg.type === "follow_up"
      );

      // Extract the assistant's message
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return {
          content: data.choices[0].message.content,
          followUpMessages: followUpMessages || [],
          conversationId: conversationId,
        };
      }

      return { error: "Unexpected response format" };
    }
  } catch (error) {
    return {
      error: `Failed to send message: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
export async function retrieveUserConversations(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`/api/chat/conversations-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    });

    const result = await response.json();

    //proxy already formats the response
    return result;
  } catch (error) {
    return {
      success: false,
      error: `Failed to request conversations: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
export async function retrieveConversationMessages(
  conversationId: string
): Promise<{ success: boolean; messages?: any[]; error?: string }> {
  try {
    if (!conversationId) {
      return {
        success: false,
        error: "Conversation ID is required",
      };
    }

    const response = await fetch(`/api/chat/conversations-history-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();
    console.log("Response ", result);
    // Xử lý response có định dạng {"code": 200, "messages": [...]}
    if (result.success && Array.isArray(result.data)) {
      return {
        success: true,
        messages: result.data,
      };
    } else if (Array.isArray(result)) {
      // Trường hợp API trả về mảng trực tiếp
      return {
        success: true,
        messages: result,
      };
    } else {
      console.error("Unexpected API response format:", result);
      return {
        success: false,
        error: "Unexpected response format",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to retrieve conversation history: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
