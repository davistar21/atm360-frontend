// /components/zeni/ZeniPanel.tsx
"use client";

import { useState } from "react";
import { useChatbotStore } from "@/lib/store/chatbotStore";
import { ZeniMessage } from "@/types/zeniTypes";
import { Loader2, Send } from "lucide-react";

export default function ZeniPanel() {
  const { messages, sendMessage, isLoading, clearChat } = useChatbotStore();
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-[80vh] border rounded-xl bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-gray-800">🤖 Zeni Assistant</h2>
        <button
          onClick={clearChat}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg: ZeniMessage) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center p-3 border-t bg-gray-50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Zeni anything..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="ml-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
