"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, User, Bot, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

// Helper to convert URLs to clickable links with friendly names
function renderMessageContent(text: string) {
    // Map of known URLs to friendly names
    const friendlyNames: Record<string, string> = {
        "https://facebook.com/ontriq": "Facebook",
        "https://www.facebook.com/ontriq": "Facebook",
        "https://twitter.com/ontriq": "Twitter/X",
        "https://www.twitter.com/ontriq": "Twitter/X",
        "https://instagram.com/ontriq": "Instagram",
        "https://www.instagram.com/ontriq": "Instagram",
        "https://linkedin.com/company/ontriq": "LinkedIn",
        "https://www.linkedin.com/company/ontriq": "LinkedIn",
        "https://www.ontriq.com/contact": "Contact Page",
        "https://ontriq.com/contact": "Contact Page",
    };

    // Regex to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (urlRegex.test(part)) {
            // Reset regex lastIndex
            urlRegex.lastIndex = 0;
            // Clean up the URL (remove trailing punctuation)
            const cleanUrl = part.replace(/[.,;:!?)]+$/, "");
            const trailingPunctuation = part.slice(cleanUrl.length);

            // Get friendly name or extract domain
            let displayName = friendlyNames[cleanUrl];
            if (!displayName) {
                try {
                    const url = new URL(cleanUrl);
                    displayName = url.hostname.replace("www.", "");
                } catch {
                    displayName = cleanUrl;
                }
            }

            return (
                <span key={index}>
                    <a
                        href={cleanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0A1A2F] hover:text-[#1a3050] underline underline-offset-2 font-medium"
                    >
                        {displayName}
                    </a>
                    {trailingPunctuation}
                </span>
            );
        }

        // Handle bold text parsing: **text** -> <strong>text</strong>
        const boldRegex = /\*\*(.*?)\*\*/g;
        const boldParts = part.split(boldRegex);

        return (
            <span key={index}>
                {boldParts.map((subPart, subIndex) => {
                    if (subIndex % 2 === 1) {
                        return <strong key={subIndex}>{subPart}</strong>;
                    }
                    return subPart;
                })}
            </span>
        );
    });
}


export function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        setError(null);

        // Add user message immediately
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: trimmedInput,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Prepare messages for API
            const apiMessages = [...messages, userMessage].map(msg => ({
                role: msg.role,
                content: msg.content,
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: apiMessages }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            // Add assistant message
            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: data.content || "I apologize, but I couldn't generate a response. Please try again.",
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (err) {
            console.error("Error sending message:", err);
            setError(err instanceof Error ? err.message : "Failed to send message");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-[92vw] sm:w-[420px] h-[580px] border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-white"
                        style={{
                            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15), 0 0 60px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 bg-[#0A1A2F] flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden">
                                    <Image
                                        src="/ontriq-favicon.png"
                                        alt="Ontriq"
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm tracking-wide text-[#F75834]">Ontriq Assistant</h3>
                                    <p className="text-xs text-gray-400">Always here to help</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-white">
                            {messages.length === 0 && !isLoading && (
                                <div className="text-center mt-12 space-y-4 opacity-90">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 mx-auto flex items-center justify-center overflow-hidden">
                                        <Image
                                            src="/ontriq-favicon.png"
                                            alt="Ontriq"
                                            width={40}
                                            height={40}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[#0A1A2F] text-sm font-medium mb-1">Welcome to Ontriq Support</p>
                                        <p className="text-gray-500 text-xs px-6">
                                            How can I assist you with our workforce solutions today?
                                        </p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-3 text-sm max-w-[88%]",
                                        m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
                                            m.role === "user" ? "bg-[#F75834]" : "bg-white"
                                        )}
                                    >
                                        {m.role === "user" ? (
                                            <User className="w-4 h-4 text-[#0A1A2F]" />
                                        ) : (
                                            <Image
                                                src="/ontriq-favicon.png"
                                                alt="Ontriq"
                                                width={20}
                                                height={20}
                                                className="object-contain"
                                            />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            "p-3 rounded-2xl shadow-sm min-w-[40px]",
                                            m.role === "user"
                                                ? "bg-[#0A1A2F] text-white rounded-tr-sm font-medium"
                                                : "bg-gray-100 border border-gray-200 text-gray-800 rounded-tl-sm"
                                        )}
                                    >
                                        <p className="leading-relaxed whitespace-pre-wrap">{renderMessageContent(m.content)}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3 text-sm max-w-[88%] mr-auto"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white overflow-hidden">
                                        <Image
                                            src="/ontriq-favicon.png"
                                            alt="Ontriq"
                                            width={20}
                                            height={20}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="p-3 rounded-2xl shadow-sm min-w-[60px] bg-gray-100 border border-gray-200 rounded-tl-sm">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-[#F75834] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-2 h-2 bg-[#F75834] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-2 h-2 bg-[#F75834] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
                            <div className="relative flex items-center">
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#0A1A2F]/20 focus:border-[#0A1A2F]/50 transition-all font-light"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputValue.trim()}
                                    className="absolute right-2 p-2 bg-[#F75834] hover:bg-[#E5502F] text-[#0A1A2F] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative w-14 h-14">
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-[#F75834] opacity-75 animate-ping" />
                )}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 bg-[#0A1A2F] border border-[#F75834]/40 rounded-full shadow-2xl flex items-center justify-center overflow-hidden hover:border-[#F75834]/60 transition-all z-50 group relative"
                    style={{
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.15)",
                    }}
                >
                    {isOpen ? (
                        <X className="w-6 h-6 text-[#F75834]" />
                    ) : (
                        <MessageCircle className="w-6 h-6 text-[#F75834]" />
                    )}
                </motion.button>
            </div>
        </div>
    );
}
