"use client";

import { motion } from "framer-motion";

const roadmapItems = [
    {
        version: "v1.1",
        title: "RAG + Streaming",
        desc: "Retrieval-augmented generation with document upload and real-time streaming responses.",
        status: "next",
    },
    {
        version: "v1.2",
        title: "Live Classroom API",
        desc: "Real-time classroom collaboration with WebSocket-based live Q&A and instant feedback.",
        status: "planned",
    },
    {
        version: "v2.0",
        title: "Multi-LLM Routing",
        desc: "Intelligent routing across multiple LLM providers based on cost, latency, and capability.",
        status: "planned",
    },
    {
        version: "v2.5",
        title: "Voice Mode",
        desc: "Speech-to-text and text-to-speech integration for hands-free AI interaction.",
        status: "planned",
    },
    {
        version: "v3.0",
        title: "Edge AI — AMD GPU Inference",
        desc: "Local inference on AMD GPUs using ROCm, enabling fully offline AI with zero cloud dependency.",
        status: "future",
    },
];

export default function Roadmap() {
    return (
        <section id="roadmap" className="py-24 px-6 relative">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Future <span className="text-red-accent">Roadmap</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Our vision for the evolution of Aegis Learn — from enhanced AI capabilities to
                        fully decentralized edge inference.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-red-accent/50 via-red-accent/20 to-transparent" />

                    <div className="space-y-8">
                        {roadmapItems.map((item, i) => (
                            <motion.div
                                key={item.version}
                                className={`relative flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                    }`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                {/* Timeline dot */}
                                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-accent border-2 border-background z-10" />

                                {/* Content card */}
                                <div className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                                    <div className="p-5 rounded-2xl border border-white/5 bg-card/30 hover:border-red-accent/15 transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2.5 py-0.5 rounded-lg bg-red-accent/10 text-red-accent text-xs font-bold">
                                                {item.version}
                                            </span>
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {item.status === "next" ? "🔥 Up Next" : item.status}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
