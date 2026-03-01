"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";

import { Mode, modeConfig } from "@/types/chat";

interface ChatInputProps {
    input: string;
    setInput: (text: string) => void;
    handleSend: () => void;
    isLoading: boolean;
    mode: Mode;
    setMode: (mode: Mode) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}


export default function ChatInput({
    input,
    setInput,
    handleSend,
    isLoading,
    mode,
    setMode,
    inputRef,
}: ChatInputProps) {

    return (
        <div className="border-t border-white/5 bg-card/20 backdrop-blur-sm p-4 shrink-0">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white/5 transition-colors shrink-0">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                            placeholder={`Message Aegis Learn (${modeConfig[mode].label})...`}
                            className="bg-white/[0.03] border-white/5 rounded-xl h-12 pr-24 text-sm placeholder:text-muted-foreground/50 focus:border-red-accent/30 focus:ring-red-accent/20"
                            disabled={isLoading}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value as any)}
                                className="bg-transparent border border-white/10 rounded-lg text-xs px-2 py-1.5 text-muted-foreground focus:outline-none cursor-pointer"
                            >
                                <option value="general" className="bg-background">General</option>
                                <option value="study" className="bg-background">Study</option>
                                <option value="code" className="bg-background">Code</option>
                            </select>
                        </div>
                    </div>
                    <Button
                        onClick={handleSend}
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="w-10 h-10 rounded-xl bg-red-accent hover:bg-red-accent-dark disabled:opacity-30 shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                    Aegis Learn processes your messages through privacy redaction and compliance checks.
                </p>
            </div>
        </div>
    );
}
