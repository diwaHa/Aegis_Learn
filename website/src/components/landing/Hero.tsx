"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor } from "lucide-react";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a0a0a] to-[#0a0a1a] animate-gradient" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40" />

            {/* Floating orbs */}
            <div className="absolute top-20 left-[10%] w-72 h-72 bg-red-accent/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-red-accent/3 rounded-full blur-3xl animate-float-delayed" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-accent/2 rounded-full blur-[120px]" />

            {/* Floating architecture elements */}
            <motion.div
                className="absolute top-32 right-[15%] hidden lg:block"
                animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-48 h-32 rounded-2xl border border-red-accent/20 bg-card/50 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-accent" />
                        <div className="w-16 h-1.5 rounded bg-red-accent/30" />
                    </div>
                    <div className="space-y-2">
                        <div className="w-full h-1.5 rounded bg-white/10" />
                        <div className="w-3/4 h-1.5 rounded bg-white/10" />
                        <div className="w-1/2 h-1.5 rounded bg-white/10" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="absolute bottom-40 left-[12%] hidden lg:block"
                animate={{ y: [0, -20, 0], rotate: [0, -3, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <div className="w-40 h-28 rounded-2xl border border-red-accent/15 bg-card/40 backdrop-blur-sm p-3">
                    <div className="flex gap-1 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-accent/60" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                    </div>
                    <div className="font-mono text-[8px] text-muted-foreground/60 space-y-1">
                        <p>{">"} privacy.scan()</p>
                        <p className="text-red-accent/80">✓ PII redacted</p>
                        <p>{">"} cache.hit()</p>
                    </div>
                </div>
            </motion.div>

            {/* GPU/Server visual */}
            <motion.div
                className="absolute top-48 left-[8%] hidden xl:block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
                <div className="w-16 h-20 rounded-lg border border-white/5 bg-card/30 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
                    <Monitor className="w-6 h-6 text-red-accent/40" />
                    <div className="w-8 h-0.5 bg-red-accent/20" />
                    <div className="w-6 h-0.5 bg-red-accent/15" />
                </div>
            </motion.div>

            {/* Main content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-accent/20 bg-red-accent/5 mb-8">
                        <div className="w-2 h-2 rounded-full bg-red-accent animate-pulse" />
                        <span className="text-sm text-red-accent-light font-medium">Multi-Mode AI Platform</span>
                    </div>
                </motion.div>

                <motion.h1
                    className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                        Aegis
                    </span>
                    <span className="bg-gradient-to-r from-red-accent to-red-accent-light bg-clip-text text-transparent">
                        Learn
                    </span>
                </motion.h1>

                <motion.p
                    className="text-xl md:text-2xl text-muted-foreground mb-4 font-light"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    A Privacy-First, Cost-Optimized, Multi-Mode AI Platform
                </motion.p>

                <motion.p
                    className="text-base md:text-lg text-muted-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    Enterprise-grade PII redaction, structured academic outputs, semantic caching
                    for cost optimization, and fully on-premise deployable — built for organizations
                    that need AI without compromise.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <Link href="/chat">
                        <Button
                            size="lg"
                            className="bg-red-accent hover:bg-red-accent-dark text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-red-accent/20 hover:shadow-red-accent/40 transition-all duration-300 group"
                        >
                            Launch AI Interface
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <a href="#architecture">
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-white/10 hover:border-white/20 px-8 py-6 text-lg rounded-2xl hover:bg-white/5 transition-all duration-300"
                        >
                            View Architecture
                        </Button>
                    </a>
                </motion.div>

                {/* Stats bar */}
                <motion.div
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    {[
                        { value: "3", label: "AI Modes" },
                        { value: "100%", label: "PII Redaction" },
                        { value: "<200ms", label: "Cache Response" },
                        { value: "AES-256", label: "Encryption" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl font-bold text-red-accent">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
    );
}

