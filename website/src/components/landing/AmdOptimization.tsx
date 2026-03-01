"use client";

import { motion } from "framer-motion";
import { Cpu, Zap, Server, Radio } from "lucide-react";

const capabilities = [
    {
        icon: Cpu,
        title: "AMD EPYC Optimized",
        desc: "Designed for deployment on AMD EPYC server processors with high core counts for parallel request servicing.",
    },
    {
        icon: Zap,
        title: "ROCm Ready",
        desc: "Can leverage AMD ROCm platform for local LLM inference, eliminating cloud API dependency entirely.",
    },
    {
        icon: Server,
        title: "GPU-Accelerated Workloads",
        desc: "Optimizable for GPU-accelerated NLP tasks including PII detection, embedding generation, and semantic similarity.",
    },
    {
        icon: Radio,
        title: "Edge AI Deployment",
        desc: "Ready for edge deployment in AI classrooms and on-premise environments with minimal infrastructure requirements.",
    },
];

export default function AmdOptimization() {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            {/* Background GPU visual */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-accent/3 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Built for{" "}
                        <span className="text-red-accent">High-Performance Compute</span>
                        {" "}Environments
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Optimized for AMD hardware ecosystems — from EPYC server processors to
                        Radeon Instinct accelerators.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="space-y-6">
                        {capabilities.map((cap, i) => (
                            <motion.div
                                key={cap.title}
                                className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-card/30 hover:border-red-accent/15 transition-all duration-300"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-accent/10 flex items-center justify-center shrink-0">
                                    <cap.icon className="w-6 h-6 text-red-accent" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{cap.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Animated GPU Illustration */}
                    <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="relative w-72 h-80">
                            {/* Server rack visualization */}
                            <motion.div
                                className="absolute inset-0 rounded-2xl border border-red-accent/20 bg-gradient-to-b from-red-accent/5 to-card/50 p-6"
                                animate={{ boxShadow: ["0 0 30px rgba(225,6,0,0.05)", "0 0 60px rgba(225,6,0,0.15)", "0 0 30px rgba(225,6,0,0.05)"] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-accent animate-pulse" />
                                    <span className="text-xs font-mono text-red-accent/80">GPU CLUSTER</span>
                                </div>

                                {/* GPU Bars */}
                                {[85, 72, 91, 68, 88, 76].map((load, i) => (
                                    <motion.div
                                        key={i}
                                        className="mb-3"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-mono text-muted-foreground">GPU:{i}</span>
                                            <span className="text-[10px] font-mono text-red-accent">{load}%</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-red-accent to-red-accent-light"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${load}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}

                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                                        <span>VRAM: 48GB</span>
                                        <span>TDP: 300W</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
