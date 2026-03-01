"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, BookOpen, Code2, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const modes = [
    {
        icon: Shield,
        title: "General Mode",
        subtitle: "Privacy Firewall",
        color: "from-red-500/20 to-red-900/20",
        borderColor: "border-red-accent/30",
        shortDesc: "spaCy-powered PII detection, industry-specific policy enforcement, risk scoring, and AES-256 encrypted audit logs.",
        longDesc: `General Mode acts as a comprehensive privacy firewall between your users and the LLM.

**Key Features:**
• **spaCy NER-based PII Detection** — Identifies names, emails, phone numbers, SSNs, and other sensitive data before it reaches the LLM.
• **Industry Policy Engine** — Enforces compliance rules specific to Healthcare (HIPAA), Finance (SOX), Legal (attorney-client privilege), and Education (FERPA).
• **Risk Scoring (0–100)** — Every query receives a real-time risk assessment. High-risk queries trigger additional safeguards.
• **AES-256 Encrypted Audit Logs** — Every interaction is logged with Fernet encryption, stored securely in MongoDB for compliance audits.
• **Automatic Redaction** — PII is replaced with safe placeholders before the query is sent to the LLM, then restored in the response.`,
    },
    {
        icon: BookOpen,
        title: "Study Mode",
        subtitle: "Academic Schema Engine",
        color: "from-blue-500/20 to-blue-900/20",
        borderColor: "border-blue-500/30",
        shortDesc: "Pydantic-validated structured outputs with summaries, key concepts, quizzes, and Google Classroom integration.",
        longDesc: `Study Mode transforms LLM responses into structured academic content validated by Pydantic schemas.

**Key Features:**
• **Structured Schema Output** — Every response includes summary, key_concepts, detailed_notes, quiz_questions, and references in a validated JSON format.
• **Pydantic Validation** — Strict schema enforcement ensures consistent, parseable outputs every time.
• **Google Classroom Integration** — Fetches courses, assignments, and deadlines directly from Google Classroom API.
• **Deadline Reminder Engine** — APScheduler-powered background jobs that check for upcoming deadlines and send proactive alerts.
• **Academic Context** — Maintains session history optimized for educational conversations and progressive learning.`,
    },
    {
        icon: Code2,
        title: "Code Mode",
        subtitle: "A2UI Structured UI Generator",
        color: "from-green-500/20 to-green-900/20",
        borderColor: "border-green-500/30",
        shortDesc: "Generates A2UI protocol-compliant structured UI definitions from natural language descriptions.",
        longDesc: `Code Mode generates structured UI definitions following the A2UI (Abstract-to-UI) protocol.

**Key Features:**
• **A2UI Protocol Compliance** — Outputs structured JSONL following the A2UI specification for platform-agnostic UI generation.
• **Component-Level Generation** — Produces Headings, Text, Images, Buttons, Containers, Cards, and more from natural language.
• **Schema Validation** — Every generated UI definition is validated against the A2UI JSON schema before delivery.
• **Streaming Support** — Progressive rendering of UI components as they are generated.
• **Cross-Platform** — Generated definitions can be rendered by Lit, Angular, or Flutter renderers.`,
    },
];

export default function SolutionOverview() {
    const [openMode, setOpenMode] = useState<number | null>(null);

    return (
        <section className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        How Aegis Learn{" "}
                        <span className="text-red-accent">Solves This</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
                        A smart middleware layer that sits between your users and the LLM, adding privacy,
                        structure, and cost optimization.
                    </p>
                </motion.div>

                {/* Architecture Flow */}
                <motion.div
                    className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="px-6 py-4 rounded-2xl border border-white/10 bg-card/50 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Input</div>
                        <div className="font-semibold">User</div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
                    <div className="px-8 py-4 rounded-2xl border-2 border-red-accent/40 bg-gradient-to-r from-red-accent/10 to-red-accent/5 text-center animate-pulse-glow">
                        <div className="text-sm text-red-accent mb-1">Middleware</div>
                        <div className="font-bold text-red-accent-light">Aegis Learn</div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
                    <div className="px-6 py-4 rounded-2xl border border-white/10 bg-card/50 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Output</div>
                        <div className="font-semibold">LLM</div>
                    </div>
                </motion.div>

                {/* Mode Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modes.map((mode, index) => (
                        <motion.div
                            key={mode.title}
                            className={`group relative p-6 rounded-2xl border ${mode.borderColor} bg-gradient-to-br ${mode.color} backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-all duration-300`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            onClick={() => setOpenMode(index)}
                        >
                            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                <mode.icon className="w-7 h-7 text-white/80" />
                            </div>
                            <h3 className="text-xl font-bold mb-1">{mode.title}</h3>
                            <p className="text-sm text-red-accent-light font-medium mb-3">
                                {mode.subtitle}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {mode.shortDesc}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-sm text-white/60 group-hover:text-white/80 transition-colors">
                                <span>Learn more</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Mode Detail Modals */}
                {modes.map((mode, index) => (
                    <Dialog
                        key={mode.title}
                        open={openMode === index}
                        onOpenChange={(open) => !open && setOpenMode(null)}
                    >
                        <DialogContent className="max-w-lg bg-card border-white/10">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-xl">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                                        <mode.icon className="w-5 h-5" />
                                    </div>
                                    {mode.title} — {mode.subtitle}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mt-2">
                                {mode.longDesc}
                            </div>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </section>
    );
}
