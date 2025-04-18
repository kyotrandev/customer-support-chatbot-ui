// components/chat/chat-button.tsx - Client Component
'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatDialog from './chat-dialog';

export default function ChatButton() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="rounded-full p-4 shadow-lg" 
          onClick={() => setChatOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="ml-2">Chat Now</span>
        </Button>
      </div>
      
      <ChatDialog open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}