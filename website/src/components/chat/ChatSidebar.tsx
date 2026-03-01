"use client";

import { motion } from "framer-motion";
import { MessageSquare, Plus, Trash2, BarChart3, AlertTriangle, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { Session, Mode, modeConfig } from "@/types/chat";

interface ChatSidebarProps {
    mode: Mode;
    setMode: (mode: Mode) => void;
    sessions: Session[];
    activeSession: string;
    setActiveSession: (id: string) => void;
    handleNewSession: () => void;
    handleDeleteMessages: () => void;
    handleClearCache: () => void;
    totalTokens: number;
    currentRiskScore: number | null;
}


export default function ChatSidebar({
    mode,
    setMode,
    sessions,
    activeSession,
    setActiveSession,
    handleNewSession,
    handleDeleteMessages,
    handleClearCache,
    totalTokens,
    currentRiskScore,
}: ChatSidebarProps) {

    return (
        <TooltipProvider>
            <div className="h-full flex flex-col overflow-hidden">
                {/* Logo */}
                <div className="p-4 flex items-center gap-3 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-red-accent flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <Link href="/" className="font-bold text-lg hover:text-red-accent transition-colors">
                        Aegis Learn
                    </Link>
                </div>

                <Separator className="bg-white/5 flex-shrink-0" />

                {/* Mode Selector */}
                <div className="p-4 flex-shrink-0">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Mode
                    </h3>
                    <div className="space-y-2">
                        {(Object.keys(modeConfig) as Mode[]).map((m) => {
                            const config = modeConfig[m];
                            return (
                                <button
                                    key={m.toString()}
                                    onClick={() => setMode(m)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${mode === m
                                        ? `${config.bg} ${config.border} border`
                                        : "hover:bg-white/5 border border-transparent"
                                        }`}
                                >
                                    <config.icon className={`w-5 h-5 ${config.color}`} />
                                    <div>
                                        <div className={`text-sm font-medium ${mode === m ? config.color : ""}`}>
                                            {config.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{config.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Session History */}
                <div className="p-4 flex-1 overflow-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Sessions
                        </h3>
                        <div className="flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleDeleteMessages}
                                        className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Clear messages</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleNewSession}
                                        className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">New session</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {sessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => setActiveSession(session.id)}
                                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-all ${activeSession === session.id
                                    ? "bg-white/5 text-white"
                                    : "text-muted-foreground hover:bg-white/[0.03]"
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4 shrink-0" />
                                <span className="truncate">{session.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Stats */}
                <div className="p-4 space-y-3 flex-shrink-0">
                    <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Token Usage</span>
                        </div>
                        <div className="text-lg font-bold">{totalTokens.toLocaleString()}</div>
                    </div>

                    {mode === "general" && currentRiskScore !== null && (
                        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Risk Score</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-lg font-bold">{currentRiskScore}</div>
                                <div
                                    className={`w-2 h-2 rounded-full ${currentRiskScore < 30
                                        ? "bg-green-500"
                                        : currentRiskScore < 70
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        }`}
                                />
                            </div>
                            <div className="mt-2 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${currentRiskScore < 30
                                        ? "bg-green-500"
                                        : currentRiskScore < 70
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        }`}
                                    style={{ width: `${currentRiskScore}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleClearCache}
                            className="flex items-center justify-center gap-2 p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 text-[10px] text-muted-foreground hover:text-red-400 transition-all"
                        >
                            <Trash2 className="w-3 h-3" />
                            Clear Cache
                        </button>
                        <button
                            onClick={() => alert("Audit log viewer coming soon in Admin panel.")}
                            className="flex items-center justify-center gap-2 p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-blue-500/10 hover:border-blue-500/20 text-[10px] text-muted-foreground hover:text-blue-400 transition-all"
                        >
                            <BarChart3 className="w-3 h-3" />
                            Audit Logs
                        </button>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
