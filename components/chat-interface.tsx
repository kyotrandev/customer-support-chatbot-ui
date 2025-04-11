'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Settings, RefreshCw, List } from 'lucide-react';
import ConfigForm from './config-form';
import ReactMarkdown from 'react-markdown';

import {
  sendMessageToCoze,
  generateUserId,
  retrieveConversationMessages,
  retrieveUserConversations,
} from '@/lib/api';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
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
  const { t } = useTranslation('chat');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
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

  useEffect(() => {
    const savedConfig = localStorage.getItem('cozeConfig');
    if (savedConfig) {
      try {
        const parsedConfig: Config = JSON.parse(savedConfig);
        if (!parsedConfig.userId) {
          parsedConfig.userId = generateUserId();
          localStorage.setItem('cozeConfig', JSON.stringify(parsedConfig));
        }
        setConfig(parsedConfig);

        if (parsedConfig.conversationId) {
          loadConversationHistory(parsedConfig);
        } else if (parsedConfig.userId) {
          // Load user conversations when there's no active conversationId
          loadUserConversations(parsedConfig.userId);
        }
      } catch {
        localStorage.removeItem('cozeConfig');
      }
    }
  }, []);

  const loadUserConversations = async (userId: string) => {
    // hard code userId for testing
    userId = '66599eb8982ed93d46fc3dba';
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
          const updatedConfig = { ...config, conversationId: mostRecent.conversation_id };
          setConfig(updatedConfig);
          localStorage.setItem('cozeConfig', JSON.stringify(updatedConfig));
          loadConversationHistory(updatedConfig);
        }
      } else if (result.error) {
        setError(t('error.loadingConversations') + `: ${result.error}`);
      }
    } catch (error) {
      setError(t('error.loadingConversationsRetry'));
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Helper function to parse the updated_at string into a Date object
  const parseUpdatedAt = (dateString: string) => {
    // Format is "DD-MM-YYYY HH:MM"
    try {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      
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
        currentConfig.conversationId,
        currentConfig.apiKey
      );

      if (result.success && result.messages) {
        const historyMessages: Message[] = result.messages
          .filter(
            (msg) =>
              msg?.role === 'user' ||
              (msg?.role === 'assistant' && msg?.type === 'answer')
          )
          .map((msg) => ({
            id: msg?.id,
            role: msg?.role as 'user' | 'assistant',
            content: msg?.content || '',
          }))
          .sort((a, b) => {
            const timeA =
              result.messages?.find((m) => m?.id === a.id)?.created_at || 0;
            const timeB =
              result.messages?.find((m) => m?.id === b.id)?.created_at || 0;
            return timeA - timeB;
          });

        setMessages(historyMessages);
      } else if (result.error) {
        setError(t('error.loadingHistory') + `: ${result.error}`);
      }
    } catch {
      setError(t('error.loadingHistoryRetry'));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !config) {
      if (!config) setConfigOpen(true); 
      return;
    }
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('thinking') },
      ]);

      const { error, conversationId } = await sendMessageToCoze(
        input,
        config,
        (chunk: string) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              role: 'assistant',
              content:
                updated[lastIndex].content === t('thinking')
                  ? chunk
                  : updated[lastIndex].content + chunk,
            };
            return updated;
          });
        }
      );

      if (conversationId && conversationId !== config.conversationId) {
        const updatedConfig = { ...config, conversationId };
        setConfig(updatedConfig);
        localStorage.setItem('cozeConfig', JSON.stringify(updatedConfig));
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
            role: 'assistant',
            content: `${t('error.prefix')}: ${error}`,
          };
          return updated;
        });
      }
    } catch {
      setError(t('error.sendMessage'));
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          role: 'assistant',
          content: `${t('error.prefix')}: ${t('error.sendMessage')}`,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigSaved = (newConfig: Config) => {
    setConfig(newConfig);
    localStorage.setItem('cozeConfig', JSON.stringify(newConfig));
    
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
    localStorage.setItem('cozeConfig', JSON.stringify(updatedConfig));
    loadConversationHistory(updatedConfig);
    setConversationsOpen(false);
  };

  const handleNewConversation = () => {
    if (!config) return;
    
    const updatedConfig = { ...config };
    delete updatedConfig.conversationId;
    setConfig(updatedConfig);
    localStorage.setItem('cozeConfig', JSON.stringify(updatedConfig));
    setMessages([]);
    setConversationsOpen(false);
  };

  return (
    <div className="flex flex-col h-[90vh]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex items-center gap-2">
          {config?.userId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConversationsOpen(true)}
              disabled={isLoadingConversations}
              title={t('conversations')}
            >
              <List className="h-4 w-4 mr-1" />
              {t('conversations')}
            </Button>
          )}
          {config?.conversationId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshHistory}
              disabled={isLoadingHistory}
              title={t('refresh')}
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
            className="flex items-center gap-1"
          >
            <Settings className="h-4 w-4" />
            <span>{t('config')}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-4 space-y-3 rounded-md border">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <p className="text-gray-400">{t('loadingHistory')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            {!config ? (
              <>
                <p className="text-gray-400 text-center">
                  {t('pleaseConfig')}
                </p>
                <Button onClick={() => setConfigOpen(true)}>
                  {t('configAPI')}
                </Button>
              </>
            ) : (
              <p className="text-gray-400">{t('startChat')}</p>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="inline-block max-w-full sm:max-w-[80%]">
                <div
                  className={`p-3 rounded-lg break-words whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 prose dark:prose-invert overflow-x-auto'
                  }`}
                >
                  {message.role === 'user' ? (
                    message.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => {
                          const content = props.children;
                          if (
                            !content ||
                            (Array.isArray(content) && content.length === 0) ||
                            (typeof content === 'string' &&
                              content.trim() === '')
                          ) {
                            return null;
                          }
                          return (
                            <p
                              className="my-1 first:mt-0 last:mb-0"
                              {...props}
                            />
                          );
                        },
                      }}
                    >
                      {message.content
                        .split('\n')
                        .filter((line) => line.trim())
                        .join('\n')}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {error && (
          <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            config ? t('inputPlaceholder') : t('pleaseConfigPlaceholder')
          }
          className="w-full resize-none pr-12 min-h-[64px] max-h-[150px] py-3"
          disabled={isLoading || isLoadingHistory || !config}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-3 right-3"
          disabled={isLoading || isLoadingHistory || !input.trim() || !config}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <ConfigForm
        open={configOpen}
        onOpenChange={setConfigOpen}
        onConfigSaved={handleConfigSaved}
        initialConfig={config || undefined}
      />
      
      {/* Conversations Dialog */}
      {conversationsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('conversations')}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConversationsOpen(false)}
              >
                {t('close')}
              </Button>
            </div>
            
            {isLoadingConversations ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <p>{t('loadingConversations')}</p>
              </div>
            ) : (
              <>
                <Button
                  className="w-full mb-2"
                  onClick={handleNewConversation}
                >
                  {t('newConversation')}
                </Button>
                
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">
                      {t('noConversations')}
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
                          className={`p-3 rounded-md cursor-pointer ${
                            config?.conversationId === conv.conversation_id
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => handleSelectConversation(conv.conversation_id)}
                        >
                          <p className="font-medium truncate">{conv.title || t('untitledConversation')}</p>
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