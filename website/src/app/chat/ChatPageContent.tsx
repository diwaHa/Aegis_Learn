"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Shield,
    BookOpen,
    Code2,
    Send,
    Copy,
    Check,
    Braces,
    Menu,
    LogOut,
    User,
    Sparkles,
    Paperclip,
    AlertTriangle,
    BarChart3,
    MessageSquare,
    Plus,
    Trash2,
} from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatTopBar from "@/components/chat/ChatTopBar";
import { sendChatMessage, getAuthToken, clearSession, sendA2UIMessage } from "@/lib/api";
import { Mode, Message, Session, modeConfig } from "@/types/chat";
import A2UIPreview from "@/components/a2ui/A2UIPreview";
import A2UIEditor from "@/components/a2ui/A2UIEditor";
import A2UILibrary from "@/components/a2ui/A2UILibrary";
import A2UIRenderer from "@/lib/a2ui-renderer";

export default function ChatPageContent() {
    const [mode, setMode] = useState<Mode>("general");
    const [a2uiMode, setA2uiMode] = useState<'generate' | 'edit' | 'preview'>('generate');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showJson, setShowJson] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [totalTokens, setTotalTokens] = useState(0);
    const [currentRiskScore, setCurrentRiskScore] = useState<number | null>(null);
    const [sessions, setSessions] = useState<Session[]>([
        { id: "default_session", title: "New Chat", mode: "general", messageCount: 0, lastMessage: new Date() },
    ]);
    const [activeSession, setActiveSession] = useState("default_session");
    const [streamingText, setStreamingText] = useState("");
    const [currentA2UI, setCurrentA2UI] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load from localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem("aegis_messages");
        const savedSessions = localStorage.getItem("aegis_sessions");
        const savedTotals = localStorage.getItem("aegis_total_tokens");

        if (savedMessages) setMessages(JSON.parse(savedMessages).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        if (savedSessions) setSessions(JSON.parse(savedSessions).map((s: any) => ({ ...s, lastMessage: new Date(s.lastMessage) })));
        if (savedTotals) setTotalTokens(parseInt(savedTotals));
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (messages.length > 0) localStorage.setItem("aegis_messages", JSON.stringify(messages));
        if (sessions.length > 0) localStorage.setItem("aegis_sessions", JSON.stringify(sessions));
        localStorage.setItem("aegis_total_tokens", totalTokens.toString());
    }, [messages, sessions, totalTokens]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingText]);

    // Authenticate on mount
    useEffect(() => {
        const authenticate = async () => {
            try {
                // First test basic connectivity
                console.log("Testing backend connectivity...");
                const testResponse = await fetch("http://localhost:8000/");
                console.log("Backend test response:", testResponse.status);
                
                if (testResponse.ok) {
                    const testData = await testResponse.json();
                    console.log("Backend test data:", testData);
                }
                
                console.log("Attempting authentication...");
                console.log("API_URL:", process.env.NEXT_PUBLIC_API_URL);
                const auth = await getAuthToken("web_user");
                console.log("Auth response:", auth);
                setToken(auth.access_token);
            } catch (error) {
                console.error("Failed to authenticate:", error);
                console.error("Error details:", error instanceof Error ? error.message : String(error));
                console.error("Error name:", error instanceof Error ? error.name : String(error));
            }
        };
        authenticate();
    }, []);

    const simulateStreaming = useCallback((text: string, callback: () => void) => {
        let i = 0;
        setStreamingText("");
        const interval = setInterval(() => {
            if (i < text.length) {
                setStreamingText((prev) => prev + text[i]);
                i++;
            } else {
                clearInterval(interval);
                setStreamingText("");
                callback();
            }
        }, 12);
        return () => clearInterval(interval);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            mode,
            timestamp: new Date(),
        };

        setIsLoading(true);
        try {
            let responseText = "";

            if (mode === "code" && a2uiMode === 'generate') {
                // Generate A2UI from natural language using real API
                try {
                    const response = await sendA2UIMessage({
                        message: input,
                        session_id: activeSession,
                        a2ui_data: currentA2UI
                    }, token!);

                    if (response.status === "success") {
                        // Handle A2UI responses from code mode
                        if (response.data.type === "a2ui_response" && response.data.payload) {
                            console.log("A2UI response received:", response.data);
                            setCurrentA2UI(response.data.payload as any);
                            responseText = "A2UI interface generated successfully!";
                        } 
                        // Fallback for other A2UI response formats
                        else {
                            const a2uiResponse = response.data.output || response.data.llm_response;
                            if (a2uiResponse) {
                                try {
                                    const parsedA2UI = JSON.parse(a2uiResponse);
                                    setCurrentA2UI(parsedA2UI as any);
                                    responseText = a2uiResponse;
                                } catch (e) {
                                    console.error("Failed to parse A2UI response:", e);
                                    responseText = "A2UI response format error";
                                }
                            }
                        }
                    }
                } catch (error) {
                    responseText = `Error generating A2UI: ${error instanceof Error ? error.message : 'Unknown error'}`;
                }
            } else {
                // Regular chat message
                const response = await sendChatMessage({
                    mode,
                    message: input,
                    session_id: activeSession,
                    industry: mode === "study" ? "education" : undefined,
                }, token!);

                if (response.status === "success") {
                    // Handle casual responses
                    if (response.data.type === "casual_response") {
                        responseText = (response.data.content as string) || "Hello! How can I help you with your studies today?";
                    }
                    // Handle structured academic responses from study mode
                    else if (response.data.type === "structured_academic_response") {
                        const content = response.data.content as any;
                        if (response.data.template === "2_mark" && content.points) {
                            responseText = `**${content.title}**\n\n${content.points.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n')}`;
                        } else if (response.data.template === "13_mark" && content.introduction) {
                            responseText = `**${content.title || 'Answer'}**\n\n**Introduction:** ${content.introduction}\n**Diagram:** ${content.diagram_description}\n**Explanation:**\n${content.explanation_points.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n')}\n**Advantages:**\n${content.advantages.map((adv: string) => `- ${adv}`).join('\n')}\n**Conclusion:** ${content.conclusion}`;
                        } else if (response.data.template === "mcq" && content.question) {
                            responseText = `**Question:** ${content.question}\n\n${content.options.map((opt: any) => `${opt.label}. ${opt.text}`).join('\n')}\n**Correct Answer:** ${content.correct_option}\n**Explanation:** ${content.explanation}`;
                        } else {
                            responseText = JSON.stringify(content, null, 2);
                        }
                    } else {
                        // Regular responses
                        responseText = response.data.llm_response || response.data.output || JSON.stringify(response.data) || "No response";
                    }
                    
                    const assistantMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: responseText,
                        mode,
                        timestamp: new Date(),
                        riskScore: response.data.risk_score as number | undefined,
                        piiDetected: response.data.pii_detected as string[] | undefined,
                        rawJson: response.data,
                        fromCache: response.data.from_cache as boolean | undefined,
                        tokenUsage: response.data.token_usage as Message["tokenUsage"],
                    };

                    if (response.data.risk_score !== undefined) {
                        setCurrentRiskScore(response.data.risk_score as number);
                    }
                    if (assistantMessage.tokenUsage) {
                        setTotalTokens((prev) => prev + assistantMessage.tokenUsage!.total_tokens);
                    }

                    // Simulate streaming effect
                    simulateStreaming(responseText, () => {
                        setMessages((prev) => [...prev, assistantMessage]);
                    });
                } else {
                    throw new Error(responseText);
                }
            }
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
                mode,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }

        // Update session
        setSessions((prev) =>
            prev.map((s) =>
                s.id === activeSession
                    ? { ...s, messageCount: s.messageCount + 1, lastMessage: new Date(), mode }
                    : s
            )
        );
    };

    const handleCopy = useCallback((text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    const handleNewSession = useCallback(() => {
        const newId = `session_${Date.now()}`;
        setSessions((prev) => [
            { id: newId, title: "New Chat", mode, messageCount: 0, lastMessage: new Date() },
            ...prev,
        ]);
        setActiveSession(newId);
        setMessages([]);
        setCurrentRiskScore(null);
    }, [mode]);

    const handleDeleteMessages = useCallback(() => {
        if (!confirm("Clear all messages in this session?")) return;
        setMessages([]);
        setTotalTokens(0);
        setCurrentRiskScore(null);
        localStorage.removeItem("aegis_messages");
    }, []);

    const handleClearCache = useCallback(async () => {
        if (!confirm("Are you sure you want to clear the global semantic cache?")) return;
        try {
            await clearSession("global", token!);
            alert("Cache cleared successfully");
        } catch (err: any) {
            alert(err.message);
        }
    }, [token]);

    const sidebarContent = (
        <ChatSidebar
            mode={mode}
            setMode={setMode}
            sessions={sessions}
            activeSession={activeSession}
            setActiveSession={setActiveSession}
            handleNewSession={handleNewSession}
            handleDeleteMessages={handleDeleteMessages}
            handleClearCache={handleClearCache}
            totalTokens={totalTokens}
            currentRiskScore={currentRiskScore}
        />
    );

    return (
        <div className="h-screen flex bg-background">
            {/* Desktop Sidebar - Fixed Position */}
            <aside className="hidden lg:flex w-72 border-r border-white/5 bg-card/30 flex-col fixed h-screen left-0 top-0 z-10">
                {sidebarContent}
            </aside>

            {/* Main Area - Add left margin to account for fixed sidebar */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
                {/* Top Bar */}
                <ChatTopBar
                    mode={mode}
                    sidebarContent={sidebarContent}
                />

                {/* Messages Area */}
                <ChatMessages
                    messages={messages}
                    streamingText={streamingText}
                    isLoading={isLoading}
                    showJson={showJson}
                    setShowJson={setShowJson}
                    copiedId={copiedId}
                    handleCopy={handleCopy}
                    messagesEndRef={messagesEndRef}
                    mode={mode}
                    setInput={setInput}
                    a2uiData={currentA2UI}
                    setA2uiData={setCurrentA2UI}
                />
                
                {/* A2UI Editor/Preview Area */}
                {mode === 'code' && (
                    <div className="border-l-4 border-green-500/30 bg-gradient-to-r from-green-500/10 to-green-900/5 rounded-lg p-6 mb-4">
                        {/* A2UI Mode Controls */}
                        <div className="flex gap-2 mb-4">
                            <Button
                                variant={a2uiMode === 'generate' ? 'default' : 'outline'}
                                onClick={() => setA2uiMode('generate')}
                            >
                                Generate
                            </Button>
                            <Button
                                variant={a2uiMode === 'edit' ? 'default' : 'outline'}
                                onClick={() => setA2uiMode('edit')}
                            >
                                Edit
                            </Button>
                            <Button
                                variant={a2uiMode === 'preview' ? 'default' : 'outline'}
                                onClick={() => setA2uiMode('preview')}
                            >
                                Preview
                            </Button>
                        </div>
                        
                        {/* A2UI Content */}
                        {a2uiMode === 'edit' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <A2UIEditor
                                    initialA2UI={currentA2UI || "{}"}
                                    onA2UIChange={(a2ui) => setCurrentA2UI(a2ui)}
                                    onSave={(a2ui) => {
                                        setCurrentA2UI(a2ui);
                                        console.log('A2UI saved:', a2ui);
                                    }}
                                />
                                <A2UILibrary
                                    onInsertA2UI={(a2ui) => setCurrentA2UI(a2ui)}
                                />
                            </div>
                        )}
                        
                        {a2uiMode === 'preview' && currentA2UI && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <A2UIPreview
                                    a2uiData={currentA2UI}
                                    isVisible={true}
                                    onExport={() => {
                                        const blob = new Blob([JSON.stringify(currentA2UI, null, 2)], { type: 'application/json' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'a2ui-definition.json';
                                        a.click();
                                    }}
                                />
                                <div className="border-l-4 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-900/5 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-400 mb-4">Live A2UI Rendering</h3>
                                    <A2UIRenderer
                                        data={currentA2UI}
                                        onAction={(action: any) => {
                                            console.log('A2UI Action:', action);
                                            // Handle A2UI interactions here
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Input Area */}
                <ChatInput
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    isLoading={isLoading}
                    mode={mode}
                    setMode={setMode}
                    inputRef={inputRef}
                />
            </div>
        </div>
    );
}


