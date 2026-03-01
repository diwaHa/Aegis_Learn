// Temporarily hardcoded for testing
const API_URL = "http://localhost:8000"; // process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface ChatRequest {
    mode: "general" | "study" | "code";
    message: string;
    session_id: string;
    industry?: string;
}

export interface A2UIRequest {
    message: string;
    session_id: string;
    a2ui_data?: any;
}

export interface ChatResponse {
    status: string;
    data: {
        llm_response?: string;
        output?: string;
        risk_score?: number;
        pii_detected?: string[];
        from_cache?: boolean;
        token_usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
        [key: string]: unknown;
    };
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export async function getAuthToken(userId: string): Promise<AuthResponse> {
    const url = `${API_URL}/auth/token`;
    console.log("getAuthToken called with:", { userId, url, API_URL });
    
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
    });
    
    console.log("Response status:", res.status, res.statusText);
    
    if (!res.ok) {
        const errorText = await res.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to get auth token: ${res.status} ${errorText}`);
    }
    
    const result = await res.json();
    console.log("Auth result:", result);
    return result;
}

export async function sendA2UIMessage(
    request: A2UIRequest,
    token: string
): Promise<ChatResponse> {
    const res = await fetch(`${API_URL}/a2ui/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || "A2UI request failed");
    }
    return res.json();
}

export async function sendChatMessage(
    request: ChatRequest,
    token: string
): Promise<ChatResponse> {
    const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || "Chat request failed");
    }
    return res.json();
}

export async function getCacheStats() {
    const res = await fetch(`${API_URL}/cache-stats`);
    if (!res.ok) throw new Error("Failed to fetch cache stats");
    return res.json();
}

export async function getAuditLogs(token: string) {
    const res = await fetch(`${API_URL}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
}

export async function clearSession(sessionId: string, token: string) {
    const res = await fetch(`${API_URL}/session/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to clear session");
    return res.json();
}

