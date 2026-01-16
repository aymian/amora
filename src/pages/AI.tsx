import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Send, Sparkles, User, Bot, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI('AIzaSyC4rGz8dK1eyy6UtPl2WIGqaRW0xJBfn3o');

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AI() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError('');

        try {
            // Initialize chat if not exists
            if (!chatRef.current) {
                // gemini-1.5-flash-latest is often more reliable
                const modelName = "gemini-1.5-flash-latest";
                const model = genAI.getGenerativeModel({ model: modelName });

                console.log("Initializing Gemini Chat with model:", modelName);
                chatRef.current = model.startChat({
                    history: messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }],
                    })),
                    generationConfig: {
                        maxOutputTokens: 2048,
                    },
                });
            }

            // Send message and get response
            const response = await chatRef.current.sendMessage(userMessage.content);
            const text = response.response.text();

            const assistantMessage: Message = {
                role: 'assistant',
                content: text,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (err: any) {
            console.error("AI Error:", err);
            setError(err.message || 'Failed to get response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        chatRef.current = null;
        setError('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col">
            {/* Header */}
            <div className="border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#e9c49a]/20 to-[#e9c49a]/5 border border-[#e9c49a]/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-[#e9c49a]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold tracking-tight">
                                Neural <span className="text-[#e9c49a]">Core</span>
                            </h1>
                            <p className="text-white/40 text-sm font-light">Powered by Gemini AI</p>
                        </div>
                    </div>
                    {messages.length > 0 && (
                        <Button
                            onClick={handleClearChat}
                            variant="ghost"
                            className="text-white/60 hover:text-white hover:bg-white/5 gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Chat
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#e9c49a]/20 to-[#e9c49a]/5 border border-[#e9c49a]/20 flex items-center justify-center mb-6">
                                <Sparkles className="w-10 h-10 text-[#e9c49a]" />
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-3">
                                How can I help you today?
                            </h2>
                            <p className="text-white/40 max-w-md">
                                Ask me anything! I'm powered by Google's Gemini AI and ready to assist with your questions.
                            </p>

                            {/* Suggested prompts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full max-w-2xl">
                                {[
                                    "Explain quantum computing in simple terms",
                                    "Write a creative story about space exploration",
                                    "Help me debug my JavaScript code",
                                    "What are the latest trends in AI?"
                                ].map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(prompt)}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#e9c49a]/30 hover:bg-white/10 transition-all text-left text-sm text-white/70 hover:text-white"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {message.role === 'assistant' && (
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#e9c49a]/20 to-[#e9c49a]/5 border border-[#e9c49a]/20 flex items-center justify-center shrink-0">
                                                    <Bot className="w-4 h-4 text-[#e9c49a]" />
                                                </div>
                                            )}
                                            <Card className={`max-w-[80%] p-4 ${message.role === 'user'
                                                ? 'bg-[#e9c49a] text-black border-[#e9c49a]'
                                                : 'bg-[#0A0A0A]/50 border-white/10'
                                                }`}>
                                                <div className="prose prose-invert max-w-none">
                                                    <p className={`whitespace-pre-wrap leading-relaxed ${message.role === 'user' ? 'text-black' : 'text-white/90'
                                                        }`}>
                                                        {message.content}
                                                    </p>
                                                </div>
                                            </Card>
                                            {message.role === 'user' && (
                                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#e9c49a]/20 to-[#e9c49a]/5 border border-[#e9c49a]/20 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-[#e9c49a]" />
                                    </div>
                                    <Card className="bg-[#0A0A0A]/50 border-white/10 p-4">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Thinking...</span>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center font-medium mt-4"
                        >
                            {error}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pb-6 pt-8">
                <div className="max-w-4xl mx-auto px-6">
                    <Card className="bg-[#0A0A0A]/80 backdrop-blur-xl border-white/10 p-4 rounded-2xl">
                        <div className="flex gap-3 items-end">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 resize-none max-h-32 min-h-[24px]"
                                rows={1}
                                style={{
                                    height: 'auto',
                                    minHeight: '24px'
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                }}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="h-10 w-10 p-0 rounded-xl bg-[#e9c49a] hover:bg-white text-black transition-all disabled:opacity-50 shrink-0"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                    </Card>
                    <p className="text-center text-white/30 text-xs mt-3">
                        AI can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
