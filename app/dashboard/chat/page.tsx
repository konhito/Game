"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 10,
  });

  return (
    <div className="flex min-h-[100svh] w-full flex-col items-center justify-between bg-slate-50 px-3 pb-32 pt-4 sm:px-4 sm:pb-36 sm:pt-6">
      <div className="w-full max-w-xl space-y-4 pb-6">
        {messages.map((message, i) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] px-3 py-2 text-sm shadow-sm sm:max-w-[65%]",
                message.role === "user"
                  ? "bg-[#0B93F6] text-white rounded-2xl rounded-br-sm"
                  : "bg-[#E9E9EB] text-black rounded-2xl rounded-bl-sm",
              )}
            >
              {message.parts.map((part) => {
                switch (part.type) {
                  case "text":
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="prose-sm prose-p:my-0.5 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1"
                      >
                        <Markdown>{part.text}</Markdown>
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))}
      </div>

      <form
        className="fixed bottom-0 left-0 right-0 z-20 flex w-full justify-center border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-4"
        onSubmit={handleSubmit}
      >
        <div className="flex w-full max-w-xl flex-col gap-2 rounded-lg border bg-white p-2 shadow-sm">
          <Input
            className="w-full border-0 shadow-none !ring-transparent "
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
          <div className="flex justify-end gap-3 items-center w-full">
            <Button 
              size="sm" 
              className="text-xs transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
            >
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
