"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MessageBubble from "@/components/MessageBubble";
import Link from "next/link";

const apiKey = process.env.NEXT_PUBLIC_LAMBDA_API_KEY as string;
const apiModel = process.env.NEXT_PUBLIC_LAMBDA_MODEL as string;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: apiModel,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

type Message = {
  sender: "user" | "ai";
  text: string;
};

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const run = async (userMessage: string, messages: Message[]) => {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    console.log(messages);
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
  };

  
  // Scroll function to track the bottom of the messages container
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // message sending function from user
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    try {
      const aiResponseText = await run(input, messages);

      const aiResponse: Message = { sender: "ai", text: aiResponseText };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="">
      <h1 className="text-center text-gray-300 mt-3 text-lg">Welcome! <span className="text-white"><code>Commander Lambda-2.0</code></span> is here to help you.</h1>
      <h1 className="text-center text-gray-300 mb-3 mt-1 text-sm">(Developed By: <span className="text-blue-500 underline italic"> <Link href="mailto:muneem914@gmail.com">muneem914@gmail.com</Link></span>)</h1>
      </div>
      <div className="w-full lg:w-5/6 h-[95vh] flex flex-col overflow-hidden bg-gray-900 rounded-lg shadow-lg">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              sender={message.sender}
              text={message.text}
            />
          ))}
          {isLoading && (
            <div className="text-md italic text-white">Commander Lambda is typing...</div>
          )}
          {/* Scroll to this position */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="flex p-4 bg-gray-700 border-t border-gray-500"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-2 py-1 rounded-lg bg-gray-950 text-white focus:outline-none"
          />
          <button
            type="submit"
            className="ml-2 bg-gray-800 text-white px-3 py-1 rounded-lg disabled:bg-gray-400"
            disabled={!input.trim() || isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
export default Page;
