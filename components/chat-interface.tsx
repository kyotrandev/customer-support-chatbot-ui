'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Settings, RefreshCw } from 'lucide-react';
import ConfigForm from './config-form';
import ReactMarkdown from 'react-markdown';

import {
  sendMessageToCoze,
  generateUserId,
  retrieveConversationMessages,
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

export default function ChatInterface() {
  const { t } = useTranslation('chat');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
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
        }
      } catch {
        localStorage.removeItem('cozeConfig');
      }
    }
  }, []);

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
            console.log('Current messages:', updated);
            return updated;
          });
        }
      );

      if (conversationId && conversationId !== config.conversationId) {
        const updatedConfig = { ...config, conversationId };
        setConfig(updatedConfig);
        localStorage.setItem('cozeConfig', JSON.stringify(updatedConfig));
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
    }
  };

  const handleRefreshHistory = () => {
    if (config) loadConversationHistory(config);
  };

  return (
    <div className="flex flex-col h-[90vh]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex items-center gap-2">
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
    </div>
  );
}
