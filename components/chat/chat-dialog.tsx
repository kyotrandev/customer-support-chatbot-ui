"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ChatInterface from "./chat-interface";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl w-full h-[85vh] p-0 overflow-hidden rounded-2xl border shadow-xl bg-white dark:bg-zinc-900"
      >
        {/* Close button */}
        {/* <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div> */}
        
        {/* Chat container */}
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}