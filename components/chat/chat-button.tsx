"use client";

import { useState } from "react";
import { Session } from "next-auth";
import ChatDialog from "./chat-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatButton({ session }: { session: Session | null }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {session ? (
          <div className="relative group">
            <Button
              size="lg"
              className="flex flex-col items-center justify-center rounded-full p-4 shadow-lg w-20 h-20 relative"
              onClick={() => setChatOpen(true)}
            >
              {/* Avatar bot */}
              <div className="relative">
                <img
                  src="/favicon.ico"
                  alt="Chatbot"
                  className="h-8 w-8 rounded-full"
                />
                {/* Dấu chấm online */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white dark:border-zinc-800 rounded-full" />
              </div>

              <span className="text-xs mt-1">Trợ lý Sen</span>
            </Button>

            {/* Tooltip khi hover */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Đang hoạt động
            </div>
          </div>
        ) : (
          <Link href="/auth/login">
            <Button
              size="lg"
              className="flex flex-col items-center justify-center rounded-full p-4 shadow-lg w-20 h-20"
            >
              <img
                src="/favicon.ico"
                alt="Chatbot"
                className="h-8 w-8 rounded-full"
              />
              <span className="text-xs mt-1">Trợ lý Sen</span>
            </Button>
          </Link>
        )}
      </div>

      <ChatDialog open={chatOpen} onOpenChange={setChatOpen} session = {session} />
    </>
  );
}
