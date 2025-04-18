"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import HeaderHome from '@/components/Homepage/Header';
import NavBarHome from '@/components/Homepage/Navbar';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Send,
  Settings,
  RefreshCw,
  List,
  User,
  Bot,
  X,
} from "lucide-react";
import ConfigForm from "./config-form";
import ReactMarkdown from "react-markdown";

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
  apiKey: string;
  botId: string;
  userId: string;
  conversationId?: string;
};

type UserConversation = {
  conversation_id: string;
  title: string;
  updated_at: string;
};

export default function ChatInterface() {
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

  // Assistant and user information
  const assistantName = "AI Assistant";
  const userName = "You";

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
          loadUserConversations(parsedConfig.userId);
        }
      } catch {
        localStorage.removeItem("cozeConfig");
      }
    }
  }, []);

  const loadUserConversations = async (userId: string) => {
    // hard code userId for testing
    userId = "66599eb8982ed93d46fc3dba";
    if (!userId) return;

    setIsLoadingConversations(true);
    setError(null);

    try {
      const result = await retrieveUserConversations(userId);

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
    if (!currentConfig.conversationId || !currentConfig.apiKey) return;

    setIsLoadingHistory(true);
    setError(null);

    try {
      const result = await retrieveConversationMessages(
        currentConfig.conversationId
      );

      if (result.success && result.messages) {
        console.log("Loaded messages:", result.messages);

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

        console.log("Parsed messages:", historyMessages);
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
      console.error("Exception in loading history:", error);
      setError(t("error.loadingHistoryRetry"));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, followUpQuestions]);

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
        { role: "assistant", content: t("thinking") },
      ]);

      const { error, conversationId, followUpMessages } =
        await sendMessageToCoze(message, config, (chunk: string) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              role: "assistant",
              content:
                updated[lastIndex].content === t("thinking")
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
          loadUserConversations(config.userId);
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
      loadUserConversations(newConfig.userId);
    }
  };

  const handleRefreshHistory = () => {
    if (config) {
      if (config.conversationId) {
        loadConversationHistory(config);
      }
      if (config.userId) {
        loadUserConversations(config.userId);
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
    // hard code userId for testing
    const userId = "66599eb8982ed93d46fc3dba";
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
    <div className="rounded-lg shadow-lg border max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">{t("title")}</h2>
        </div>
        <div className="flex items-center space-x-1">
          {config?.userId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConversationsOpen(true)}
              disabled={isLoadingConversations}
              title={t("conversations")}
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
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
  
      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-3 space-y-2">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <p className="text-sm text-gray-400">{t("loadingHistory")}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            {!config ? (
              <>
                <p className="text-sm text-gray-400 text-center">{t("pleaseConfig")}</p>
                <Button size="sm" onClick={() => setConfigOpen(true)}>
                  {t("configAPI")}
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-400">{t("startChat")}</p>
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
                  <div className="bg-purple-100 p-1 rounded-full">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              )}
  
              <div className="inline-block max-w-[70%]">
                <div
                  className={`p-2 rounded-lg text-sm break-words ${
                    message.role === "user"
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-gray-100 rounded-tl-none"
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
                            (typeof content === "string" && content.trim() === "")
                          ) {
                            return null;
                          }
                          return (
                            <p className="my-1 first:mt-0 last:mb-0" {...props} />
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
                <div className="text-xs text-gray-500 mt-1 mx-1">
                  {message.role === "user" ? userName : assistantName}
                </div>
              </div>
  
              {message.role === "user" && (
                <div className="flex-shrink-0 ml-2">
                  <div className="bg-blue-100 p-1 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
  
        {/* Follow-up questions */}
        {followUpQuestions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {followUpQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs py-1 px-2"
                onClick={() => handleFollowUpClick(question.content)}
                disabled={isLoading}
              >
                {question.content}
              </Button>
            ))}
          </div>
        )}
  
        {error && (
          <div className="bg-red-50 p-2 rounded-md text-red-600 text-xs">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
  
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t p-2">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config ? t("inputPlaceholder") : t("pleaseConfigPlaceholder")}
            className="w-full resize-none pr-10 min-h-[40px] max-h-[100px] py-2 text-sm"
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
            className="absolute bottom-1 right-1 h-8 w-8 p-0"
            disabled={isLoading || isLoadingHistory || !input.trim() || !config}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
  
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
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg w-full max-w-xs max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-medium">{t("conversations")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConversationsOpen(false)}
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
                  className="w-full mb-2" 
                  onClick={handleNewConversation}
                >
                  {t("newConversation")}
                </Button>
  
                <div className="space-y-1">
                  {conversations.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm p-2">
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
                          className={`p-2 rounded-md cursor-pointer text-sm ${
                            config?.conversationId === conv.conversation_id
                              ? "bg-blue-100 dark:bg-blue-900"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                          onClick={() => handleSelectConversation(conv.conversation_id)}
                        >
                          <p className="font-medium truncate text-sm">
                            {conv.title || t("untitledConversation")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
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
