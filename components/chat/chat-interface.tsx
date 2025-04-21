"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Settings, RefreshCw, List, Bot, X } from "lucide-react";
import ConfigForm from "./config-form";
import ReactMarkdown from "react-markdown";
import { Session } from "next-auth";

import {
  sendMessageToCoze,
  generateUserId,
  retrieveConversationMessages,
  retrieveUserConversations,
  initConversation,
} from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  id?: string;
};

type FollowUpMessage = {
  role: "assistant";
  type: "follow_up";
  content: string;
  content_type: string;
};

type Config = {
  botId?: string;
  userId?: string;
  conversationId?: string;
};

type UserConversation = {
  conversation_id: string;
  title: string;
  updated_at: string;
};
interface ChatInterfaceProps {
  onClose?: () => void;
  session: Session | null;
}

export default function ChatInterface({
  onClose,
  session,
}: ChatInterfaceProps) {
  const { t } = useTranslation("chat");

  const [messages, setMessages] = useState<Message[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpMessage[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [conversationsOpen, setConversationsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // hard code userId for testing
  const userId = session?.user.id || "664b289b7ced2282fcf02c3a";
  console.log("User ID:", userId);

  useEffect(() => {
    const savedConfig = localStorage.getItem("cozeConfig");
    if (savedConfig) {
      try {
        const parsedConfig: Config = JSON.parse(savedConfig);
        if (!parsedConfig.userId) {
          parsedConfig.userId = generateUserId();
          localStorage.setItem("cozeConfig", JSON.stringify(parsedConfig));
        }
        setConfig(parsedConfig);

        if (parsedConfig.conversationId) {
          loadConversationHistory(parsedConfig);
        } else if (parsedConfig.userId) {
          // Load user conversations when there's no active conversationId
          loadUserConversations();
        }
      } catch {
        localStorage.removeItem("cozeConfig");
      }
    }
  }, []);

  const loadUserConversations = async () => {
    setIsLoadingConversations(true);
    setError(null);

    try {
      const result = await retrieveUserConversations(userId);
      console.log("User Conversations:", result);
      if (result.success && result.data) {
        setConversations(result.data);

        // If no active conversation is set but conversations exist, select the most recent one
        if (result.data.length > 0 && config && !config.conversationId) {
          // Sort by updated_at in descending order (assuming updated_at is in DD-MM-YYYY HH:MM format)
          const sorted = [...result.data].sort((a, b) => {
            // Convert the updated_at string to a Date object for comparison
            const dateA = parseUpdatedAt(a.updated_at);
            const dateB = parseUpdatedAt(b.updated_at);
            return dateB.getTime() - dateA.getTime();
          });

          const mostRecent = sorted[0];
          const updatedConfig = {
            ...config,
            conversationId: mostRecent.conversation_id,
          };
          setConfig(updatedConfig);
          localStorage.setItem("cozeConfig", JSON.stringify(updatedConfig));
          loadConversationHistory(updatedConfig);
        }
      } else if (result.error) {
        setError(t("error.loadingConversations") + `: ${result.error}`);
      }
    } catch (error) {
      setError(t("error.loadingConversationsRetry"));
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Helper function to parse the updated_at string into a Date object
  const parseUpdatedAt = (dateString: string) => {
    // Format is "DD-MM-YYYY HH:MM"
    try {
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("-");
      const [hour, minute] = timePart.split(":");

      return new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed in JS Date
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
    } catch (e) {
      // If parsing fails, return current date as fallback
      return new Date();
    }
  };

  const loadConversationHistory = async (currentConfig: Config) => {
    if (!currentConfig.conversationId) return;

    setIsLoadingHistory(true);
    setError(null);

    try {
      const result = await retrieveConversationMessages(
        currentConfig.conversationId
      );

      if (result.success && result.messages) {
        const historyMessages: Message[] = result.messages
          .filter(
            (msg) =>
              msg?.role === "user" ||
              (msg?.role === "assistant" && msg?.type === "answer")
          )
          .map((msg) => ({
            id:
              msg?.id ||
              `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            role: msg?.role as "user" | "assistant",
            content: msg?.content || "",
          }));

        // Also get follow-up messages for the last assistant response
        const followUps = result.messages
          .filter(
            (msg) => msg?.role === "assistant" && msg?.type === "follow_up"
          )
          .slice(-3);

        setMessages(historyMessages);

        if (followUps.length > 0) {
          setFollowUpQuestions(followUps as FollowUpMessage[]);
        } else {
          setFollowUpQuestions([]);
        }
      } else if (result.error) {
        setError(t("error.loadingHistory") + `: ${result.error}`);
      }
    } catch (error) {
      setError(t("error.loadingHistoryRetry"));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    // Only auto-scroll on new messages or when loading is complete
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isLoading, followUpQuestions]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !config) {
      if (!config) setConfigOpen(true);
      return;
    }

    await sendMessage(input);
  };

  const handleFollowUpClick = async (question: string) => {
    await sendMessage(question);
    // Clear follow-up questions after clicking one
    setFollowUpQuestions([]);
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !config) return;

    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    // Clear existing follow-up questions when a new message is sent
    setFollowUpQuestions([]);

    try {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("Đang trả lời") },
      ]);

      const { error, conversationId, followUpMessages } =
        await sendMessageToCoze(message, userId, config, (chunk: string) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              role: "assistant",
              content:
                updated[lastIndex].content === t("Đang trả lời")
                  ? chunk
                  : updated[lastIndex].content + chunk,
            };
            return updated;
          });
        });

      // If follow-up messages were received, set them
      if (followUpMessages && followUpMessages.length > 0) {
        setFollowUpQuestions(followUpMessages.slice(0, 3));
      }

      if (conversationId && conversationId !== config.conversationId) {
        const updatedConfig = { ...config, conversationId };
        setConfig(updatedConfig);
        localStorage.setItem("cozeConfig", JSON.stringify(updatedConfig));
        // Refresh conversation list when a new conversation is created
        if (config.userId) {
          loadUserConversations();
        }
      }

      if (error) {
        setError(error);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            role: "assistant",
            content: `${t("error.prefix")}: ${error}`,
          };
          return updated;
        });
      }
    } catch {
      setError(t("error.sendMessage"));
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          role: "assistant",
          content: `${t("error.prefix")}: ${t("error.sendMessage")}`,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigSaved = (newConfig: Config) => {
    setConfig(newConfig);
    localStorage.setItem("cozeConfig", JSON.stringify(newConfig));

    if (newConfig.conversationId) {
      loadConversationHistory(newConfig);
    } else if (newConfig.userId) {
      loadUserConversations();
    }
  };

  const handleRefreshHistory = () => {
    if (config) {
      if (config.conversationId) {
        loadConversationHistory(config);
      }
      if (config.userId) {
        loadUserConversations();
      }
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    if (!config) return;

    const updatedConfig = { ...config, conversationId };
    setConfig(updatedConfig);
    localStorage.setItem("cozeConfig", JSON.stringify(updatedConfig));
    loadConversationHistory(updatedConfig);
    setConversationsOpen(false);
  };

  const handleNewConversation = async () => {
    if (!config) return;
    const conversationResponse = await initConversation(userId);

    // Ensure conversationId is extracted as a string
    const conversationId = conversationResponse.success
      ? conversationResponse.conversationId || ""
      : "";

    const updatedConfig = {
      ...config,
      conversationId: conversationId,
    };
    setConfig(updatedConfig);
    localStorage.setItem("cozeConfig", JSON.stringify(updatedConfig));
    setMessages([]);
    setFollowUpQuestions([]);
    setConversationsOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full max-h-[85vh]">
      <div className="flex-shrink-0 flex justify-between items-center p-4 border-b dark:border-zinc-800">
        <div className="flex items-center space-x-3">
          {/* Avatar bot */}
          <div className="relative">
            <img
              src="/favicon.ico"
              alt="Bot Avatar"
              className="h-10 w-10 rounded-full border-2 border-green-500"
            />
            {/* Chấm xanh online */}
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-zinc-800 rounded-full" />
          </div>
          <h2 className="text-lg font-medium">
            {"Trợ lý Sen - Chuyên viên chăm sóc khách hàng"}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {config?.userId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConversationsOpen(true)}
              disabled={isLoadingConversations}
              title={t("conversations")}
              className="h-8 w-8 p-0 rounded-full"
            >
              <List className="h-4 w-4" />
            </Button>
          )}
          {config?.conversationId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshHistory}
              disabled={isLoadingHistory}
              title={t("refresh")}
              className="h-8 w-8 p-0 rounded-full"
            >
              {isLoadingHistory ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfigOpen(true)}
            title={t("config")}
            className="h-8 w-8 p-0 rounded-full"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {/* Thêm nút X nếu onClose được truyền vào */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Close"
              className="h-8 w-8 p-0 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ minHeight: "0" }}
      >
        {/* Phần nội dung tin nhắn giữ nguyên */}
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <p className="text-sm text-gray-500">{t("loadingHistory")}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            {!config ? (
              <>
                <p className="text-sm text-gray-500 text-center">
                  {t("pleaseConfig")}
                </p>
                <Button size="sm" onClick={() => setConfigOpen(true)}>
                  {t("configAPI")}
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-500">{t("startChat")}</p>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 mr-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded-full">
                    <img
                      src="/favicon.ico"
                      alt="Bot Icon"
                      className="h-6 w-6 rounded-full"
                    />
                  </div>
                </div>
              )}

              <div className="inline-block max-w-[75%]">
                <div
                  className={`p-3 rounded-2xl text-sm break-words ${
                    message.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-zinc-800 rounded-bl-none"
                  }`}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => {
                          const content = props.children;
                          if (
                            !content ||
                            (Array.isArray(content) && content.length === 0) ||
                            (typeof content === "string" &&
                              content.trim() === "")
                          ) {
                            return null;
                          }
                          return (
                            <p
                              className="my-1.5 first:mt-0 last:mb-0"
                              {...props}
                            />
                          );
                        },
                      }}
                    >
                      {message.content
                        .split("\n")
                        .filter((line) => line.trim())
                        .join("\n")}
                    </ReactMarkdown>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 mx-1.5">
                  {message.role === "user"}
                </div>
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 ml-2"></div>
              )}
            </div>
          ))
        )}

        {/* Follow-up questions */}
        {followUpQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {followUpQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs py-1.5 px-3 rounded-full"
                onClick={() => handleFollowUpClick(question.content)}
                disabled={isLoading}
              >
                {question.content}
              </Button>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed position at bottom */}
      <div className="flex-shrink-0 border-t dark:border-zinc-800 p-4">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                config ? t("Nhâp nội dung chat") : t("pleaseConfigPlaceholder")
              }
              className="w-full resize-none pr-12 min-h-[44px] max-h-[120px] py-3 text-sm rounded-full px-4 focus-visible:ring-blue-500 dark:bg-zinc-800 dark:focus-visible:ring-blue-600"
              disabled={isLoading || isLoadingHistory || !config}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-1.5 right-1.5 h-9 w-9 p-0 rounded-full"
              disabled={
                isLoading || isLoadingHistory || !input.trim() || !config
              }
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Config Modal */}
      <ConfigForm
        open={configOpen}
        onOpenChange={setConfigOpen}
        onConfigSaved={handleConfigSaved}
        initialConfig={config || undefined}
      />

      {/* Conversations Dialog */}
      {conversationsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl w-full max-w-xs max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-medium">{t("conversations")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConversationsOpen(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isLoadingConversations ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <p className="text-sm">{t("loadingConversations")}</p>
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  className="w-full mb-3 rounded-lg"
                  onClick={handleNewConversation}
                >
                  {t("newConversation")}
                </Button>

                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm p-3">
                      {t("noConversations")}
                    </p>
                  ) : (
                    conversations
                      .sort((a, b) => {
                        const dateA = parseUpdatedAt(a.updated_at);
                        const dateB = parseUpdatedAt(b.updated_at);
                        return dateB.getTime() - dateA.getTime();
                      })
                      .map((conv) => (
                        <div
                          key={conv.conversation_id}
                          className={`p-3 rounded-lg cursor-pointer text-sm ${
                            config?.conversationId === conv.conversation_id
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600"
                          }`}
                          onClick={() =>
                            handleSelectConversation(conv.conversation_id)
                          }
                        >
                          <p className="font-medium truncate text-sm">
                            {conv.title || t("untitledConversation")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {conv.updated_at}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
