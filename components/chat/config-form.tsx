'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateUserId } from '@/lib/api';

type Config = {
  apiKey: string;
  botId: string;
  userId: string;
  conversationId?: string;
};

interface ConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved: (config: Config) => void;
  initialConfig?: Config;
}

export default function ConfigForm({
  open,
  onOpenChange,
  onConfigSaved,
  initialConfig,
}: ConfigFormProps) {
  const [formData, setFormData] = useState({
    apiKey: '',
    botId: '7488239999658639372', // Default bot ID
    conversationId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialConfig) {
      setFormData({
        apiKey: initialConfig.apiKey || '',
        botId: initialConfig.botId || '7488239999658639372', // Use default if initialConfig not provided
        conversationId: initialConfig.conversationId || '',
      });
    }
  }, [initialConfig, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.apiKey || !formData.botId) {
        setError('API Key and Bot ID are required fields');
        setIsLoading(false);
        return;
      }

      const userId = initialConfig?.userId || generateUserId();

      const newConfig: Config = {
        apiKey: formData.apiKey,
        botId: formData.botId,
        userId,
        conversationId: formData.conversationId, // Retain existing conversationId if any
      };

      onConfigSaved(newConfig);
      onOpenChange(false);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95%] sm:max-w-[425px] rounded-md">
        <DialogHeader>
          <DialogTitle>Coze API Configuration</DialogTitle>
          <DialogDescription>
            Enter your Coze API credentials to start chatting
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="text"
              value={formData.apiKey}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
              }
              placeholder="pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="botId">Bot ID</Label>
            <Input
              id="botId"
              value={formData.botId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, botId: e.target.value }))
              }
              placeholder="7488239999658639372"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversationId">Conversation ID (Optional)</Label>
            <Input
              id="conversationId"
              value={formData.conversationId || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  conversationId: e.target.value,
                }))
              }
              placeholder="Enter conversation ID to continue a specific chat"
            />
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </form>

        <p className="text-xs text-gray-400 mt-2">
          You can find the Bot ID in the bot URL on the Coze platform. The API
          key can be generated in the Coze Developer Portal. Make sure you have
          enabled permissions for Bot Management, Conversation Management,
          Dialogues, and Messaging.
        </p>
      </DialogContent>
    </Dialog>
  );
}
