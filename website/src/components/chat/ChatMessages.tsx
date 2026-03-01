"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, Check, Copy, Braces } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Message, modeConfig, Mode } from "@/types/chat";
import A2UIPreview from "@/components/a2ui/A2UIPreview";

interface ChatMessagesProps {
    messages: Message[];
    streamingText: string;
    isLoading: boolean;
    showJson: boolean;
    setShowJson: (show: boolean) => void;
    copiedId: string | null;
    handleCopy: (text: string, id: string) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    mode: Mode;
    setInput: (text: string) => void;
    a2uiData?: any;
    setA2uiData?: (a2ui: any) => void;
}


export default function ChatMessages({
    messages,
    streamingText,
    isLoading,
    showJson,
    setShowJson,
    copiedId,
    handleCopy,
    messagesEndRef,
    mode,
    setInput,
    a2uiData,
    setA2uiData,
}: ChatMessagesProps) {

    return (
        <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.length === 0 && !streamingText && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-16 h-16 rounded-2xl bg-red-accent/10 flex items-center justify-center mb-6"
                        >
                            <Sparkles className="w-8 h-8 text-red-accent" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">Aegis Learn AI</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Start a conversation using {modeConfig[mode].label}. Your messages are processed
                            through our privacy-first middleware.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                            {[
                                mode === "general"
                                    ? "Analyze the privacy risks of sharing customer data with AI"
                                    : mode === "study"
                                        ? "Explain quantum computing with key concepts and quiz"
                                        : "Create a login form with email and password fields",
                                mode === "general"
                                    ? "What HIPAA guidelines apply to AI-generated medical reports?"
                                    : mode === "study"
                                        ? "Create a study guide for machine learning fundamentals"
                                        : "Build a dashboard layout with sidebar navigation",
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setInput(suggestion)}
                                    className="text-left p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-sm text-muted-foreground hover:text-white transition-all"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] ${message.role === "user"
                                    ? "bg-red-accent/10 border border-red-accent/20 rounded-2xl rounded-br-md"
                                    : "bg-card/50 border border-white/5 rounded-2xl rounded-bl-md"
                                    } p-4`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {message.role === "assistant" && (
                                        <Sparkles className="w-3.5 h-3.5 text-red-accent" />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {message.role === "user" ? "You" : "Aegis Learn"} •{" "}
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                    {message.fromCache && (
                                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                            cached
                                        </Badge>
                                    )}
                                </div>

                                {showJson && message.rawJson ? (
                                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
                                        {JSON.stringify(message.rawJson, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {message.content}
                                    </div>
                                )}

                                {message.piiDetected && message.piiDetected.length > 0 && (
                                    <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                        <div className="flex items-center gap-1.5 text-xs text-yellow-500">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            PII Detected: {message.piiDetected.join(", ")}
                                        </div>
                                    </div>
                                )}

                                {message.role === "assistant" && (
                                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                                        <button
                                            onClick={() => handleCopy(message.content, message.id)}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                                        >
                                            {copiedId === message.id ? (
                                                <Check className="w-3.5 h-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                            {copiedId === message.id ? "Copied" : "Copy"}
                                        </button>
                                        {!!message.rawJson && (
                                            <button
                                                onClick={() => setShowJson(!showJson)}
                                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                                            >
                                                <Braces className="w-3.5 h-3.5" />
                                                {showJson ? "Hide JSON" : "View JSON"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* A2UI Preview Section */}
                {mode === 'code' && a2uiData && (
                    <A2UIPreview
                        a2uiData={a2uiData}
                        isVisible={true}
                        onCopy={() => handleCopy(JSON.stringify(a2uiData, null, 2), 'a2ui-preview')}
                        onExport={() => {
                            const blob = new Blob([JSON.stringify(a2uiData, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'a2ui-definition.json';
                            a.click();
                        }}
                    />
                )}

                {(isLoading || streamingText) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="max-w-[85%] bg-card/50 border border-white/5 rounded-2xl rounded-bl-md p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-red-accent animate-pulse" />
                                <span className="text-xs text-muted-foreground">Aegis Learn</span>
                            </div>
                            {streamingText ? (
                                <div className="text-sm leading-relaxed">
                                    {streamingText}
                                    <span className="inline-block w-1.5 h-4 bg-red-accent ml-0.5 animate-pulse" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-accent/60 animate-bounce [animation-delay:0ms]" />
                                    <div className="w-2 h-2 rounded-full bg-red-accent/60 animate-bounce [animation-delay:150ms]" />
                                    <div className="w-2 h-2 rounded-full bg-red-accent/60 animate-bounce [animation-delay:300ms]" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    );
}
