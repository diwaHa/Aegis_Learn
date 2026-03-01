import { Shield, BookOpen, Code2, LucideIcon } from "lucide-react";

export type Mode = "general" | "study" | "code";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    mode: Mode;
    timestamp: Date;
    riskScore?: number;
    piiDetected?: string[];
    rawJson?: any;
    fromCache?: boolean;
    tokenUsage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface Session {
    id: string;
    title: string;
    mode: Mode;
    messageCount: number;
    lastMessage: Date;
}

export interface ModeConfigItem {
    icon: LucideIcon;
    label: string;
    color: string;
    bg: string;
    border: string;
    description: string;
}

export const modeConfig: Record<Mode, ModeConfigItem> = {
    general: {
        icon: Shield,
        label: "General Mode",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        description: "Privacy Firewall",
    },
    study: {
        icon: BookOpen,
        label: "Study Mode",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        description: "Academic Schema",
    },
    code: {
        icon: Code2,
        label: "Code Mode",
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        description: "A2UI Generator",
    },
};
