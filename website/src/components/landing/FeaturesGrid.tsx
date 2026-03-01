"use client";

import { motion } from "framer-motion";
import {
    Fingerprint, Building2, Gauge, Lock, CheckSquare, Database,
    GraduationCap, Bell, Container, Users, BarChart3, Server,
} from "lucide-react";

const features = [
    { icon: Fingerprint, title: "spaCy-based PII Redaction", desc: "Named entity recognition detects and redacts sensitive personal information before LLM processing." },
    { icon: Building2, title: "Industry Policy Engine", desc: "Configurable compliance rules for Healthcare, Finance, Legal, and Education sectors." },
    { icon: Gauge, title: "Risk Scoring (0–100)", desc: "Real-time risk assessment on every query with configurable thresholds and alerting." },
    { icon: Lock, title: "AES-256 Encrypted Audit Logs", desc: "Fernet-encrypted audit trail stored in MongoDB for full compliance traceability." },
    { icon: CheckSquare, title: "Pydantic Schema Validation", desc: "Strict output validation ensures consistent, parseable, structured responses." },
    { icon: Database, title: "Semantic Cache", desc: "Redis-backed cosine similarity cache eliminates redundant LLM calls and cuts costs." },
    { icon: GraduationCap, title: "Google Classroom Integration", desc: "Direct integration with Google Classroom API for courses, assignments, and grading." },
    { icon: Bell, title: "Deadline Reminder Engine", desc: "APScheduler-powered background jobs for proactive deadline alerts and notifications." },
    { icon: Container, title: "Dockerized Deployment", desc: "Production-ready Docker containers with docker-compose for one-command deployment." },
    { icon: Users, title: "Multi-Tenant Ready", desc: "Session isolation and per-user context management for multi-tenant environments." },
    { icon: BarChart3, title: "Token Usage Analytics", desc: "Real-time tracking of prompt and completion tokens across all modes and sessions." },
    { icon: Server, title: "On-Premise Deployable", desc: "Full control over data sovereignty — deploy on your own infrastructure, no cloud dependency." },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
};

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-24 px-6 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-accent/[0.02] to-transparent" />
            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Enterprise-Grade <span className="text-red-accent">Feature Set</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Every feature is designed for production workloads — not demonstrations.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {features.map((f) => (
                        <motion.div
                            key={f.title}
                            variants={item}
                            className="group relative p-5 rounded-2xl border border-white/5 bg-card/30 hover:bg-card/60 hover:border-red-accent/20 transition-all duration-300 hover:scale-[1.02]"
                        >
                            <div className="w-10 h-10 rounded-lg bg-red-accent/10 flex items-center justify-center mb-3 group-hover:bg-red-accent/20 transition-colors">
                                <f.icon className="w-5 h-5 text-red-accent" />
                            </div>
                            <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
