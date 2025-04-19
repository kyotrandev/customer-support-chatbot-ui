"use client";
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ChatInterface from "./chat-interface";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl w-full h-[85vh] p-0 overflow-hidden rounded-2xl border shadow-xl bg-white dark:bg-zinc-900 [&>button]:hidden"
      >
        <div className="h-full max-h-[85vh] overflow-hidden">
          <ChatInterface onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}