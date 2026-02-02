"use client";

import { ReactNode } from "react";

interface ChatBubbleProps {
  message: string | ReactNode;
  isMe: boolean;
  sender?: string;
  timestamp?: string;
  className?: string;
}

export function ChatBubble({ message, isMe, sender, timestamp, className }: ChatBubbleProps) {
  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${className}`}>
      {!isMe && sender && (
        <span className="text-xs font-medium text-gray-500 mb-1 ml-1">
          {sender}
        </span>
      )}
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm transition-all duration-200 hover:shadow-md ${
          isMe
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
        }`}
      >
        <div className="leading-relaxed break-words">{message}</div>
        {timestamp && (
          <span
            className={`text-[10px] mt-1 block text-right ${
              isMe ? "text-blue-100" : "text-gray-400"
            }`}
          >
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
