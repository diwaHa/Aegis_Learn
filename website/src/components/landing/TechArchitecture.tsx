"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const stackItems = [
    { name: "FastAPI", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { name: "Google Gemini", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { name: "Redis", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    { name: "MongoDB", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    { name: "JWT", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    { name: "Docker", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
    { name: "APScheduler", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    { name: "spaCy", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    { name: "Pydantic", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
    { name: "LiteLLM", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
];

const phases = [
    {
        phase: "Phase 1",
        title: "Docker",
        desc: "Containerized single-node deployment with docker-compose. Production-ready out of the box.",
        status: "Current",
    },
    {
        phase: "Phase 2",
        title: "Kubernetes",
        desc: "Horizontal scaling with K8s orchestration, health checks, and auto-scaling policies.",
        status: "Planned",
    },
    {
        phase: "Phase 3",
        title: "Multi-Region",
        desc: "Global edge deployment with region-aware routing, data residency compliance, and failover.",
        status: "Future",
    },
];

export default function TechArchitecture() {
    return (
        <section id="architecture" className="py-24 px-6 relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Technical <span className="text-red-accent">Architecture</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Built on battle-tested open-source technologies for reliability, performance, and portability.
                    </p>
                </motion.div>

                {/* Architecture Diagram */}
                <motion.div
                    className="mb-16 p-8 rounded-2xl border border-white/5 bg-card/30"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="text-center p-4 rounded-xl border border-white/10 bg-white/5">
                            <div className="text-xs text-muted-foreground mb-1">Client</div>
                            <div className="font-semibold text-sm">Web / API</div>
                        </div>
                        <div className="flex items-center justify-center text-muted-foreground">
                            <div className="w-full h-px bg-gradient-to-r from-white/5 via-red-accent/30 to-white/5 hidden md:block" />
                            <span className="text-xs mx-2 whitespace-nowrap">HTTPS</span>
                            <div className="w-full h-px bg-gradient-to-r from-white/5 via-red-accent/30 to-white/5 hidden md:block" />
                        </div>
                        <div className="text-center p-4 rounded-xl border-2 border-red-accent/30 bg-red-accent/5">
                            <div className="text-xs text-red-accent mb-1">Middleware</div>
                            <div className="font-bold text-sm text-red-accent-light">Aegis Learn</div>
                            <div className="text-[10px] text-muted-foreground mt-1">FastAPI + spaCy + Redis</div>
                        </div>
                        <div className="flex items-center justify-center text-muted-foreground">
                            <div className="w-full h-px bg-gradient-to-r from-white/5 via-red-accent/30 to-white/5 hidden md:block" />
                            <span className="text-xs mx-2 whitespace-nowrap">gRPC</span>
                            <div className="w-full h-px bg-gradient-to-r from-white/5 via-red-accent/30 to-white/5 hidden md:block" />
                        </div>
                        <div className="text-center p-4 rounded-xl border border-white/10 bg-white/5">
                            <div className="text-xs text-muted-foreground mb-1">AI Engine</div>
                            <div className="font-semibold text-sm">Google Gemini</div>
                        </div>
                    </div>

                    {/* Sub-components */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {["PII Redactor", "Policy Engine", "Semantic Cache", "Audit Logger"].map((comp) => (
                            <div key={comp} className="text-center py-2 px-3 rounded-lg border border-white/5 bg-white/[0.02] text-xs text-muted-foreground">
                                {comp}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Tech Stack Badges */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-xl font-semibold mb-6 text-center">Technology Stack</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {stackItems.map((tech, i) => (
                            <motion.div
                                key={tech.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Badge
                                    variant="outline"
                                    className={`px-4 py-2 text-sm font-medium ${tech.color} rounded-xl`}
                                >
                                    {tech.name}
                                </Badge>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Scalable Infrastructure */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-xl font-semibold mb-6 text-center">Scalable Infrastructure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {phases.map((phase, i) => (
                            <motion.div
                                key={phase.phase}
                                className="relative p-6 rounded-2xl border border-white/5 bg-card/30 hover:border-red-accent/15 transition-all duration-300"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge
                                        variant={phase.status === "Current" ? "default" : "outline"}
                                        className={phase.status === "Current" ? "bg-red-accent text-white" : "text-muted-foreground"}
                                    >
                                        {phase.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{phase.phase}</span>
                                </div>
                                <h4 className="text-lg font-semibold mb-2">{phase.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{phase.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
