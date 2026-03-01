"use client";

import { motion } from "framer-motion";
import { ShieldOff, TrendingDown, FileText, ShieldX, Clock } from "lucide-react";

const problems = [
    {
        icon: ShieldOff,
        title: "No PII Filtering",
        description:
            "Raw LLM APIs send sensitive personal data directly to cloud providers with zero redaction or compliance.",
    },
    {
        icon: TrendingDown,
        title: "High API Cost",
        description:
            "Repeated similar queries burn tokens unnecessarily. No semantic caching means paying full price every time.",
    },
    {
        icon: FileText,
        title: "Unstructured Responses",
        description:
            "LLM outputs are free-form text with no schema validation, making integration with downstream systems painful.",
    },
    {
        icon: ShieldX,
        title: "No Compliance Logging",
        description:
            "No encrypted audit trails means no way to prove compliance with HIPAA, FERPA, or GDPR requirements.",
    },
    {
        icon: Clock,
        title: "No Context Awareness",
        description:
            "Each request is stateless — no session management, no history pruning, no intelligent context windows.",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function ProblemSection() {
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
                        Why Raw LLM APIs Are{" "}
                        <span className="text-red-accent">Not Production-Ready</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Using LLM APIs directly in production creates security, cost, and integration
                        challenges that scale with every user.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {problems.map((problem) => (
                        <motion.div
                            key={problem.title}
                            variants={item}
                            className="group relative p-6 rounded-2xl border border-white/5 bg-card/50 backdrop-blur-sm hover:border-red-accent/20 transition-all duration-300"
                        >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-red-accent/10 flex items-center justify-center mb-4 group-hover:bg-red-accent/20 transition-colors">
                                    <problem.icon className="w-6 h-6 text-red-accent" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {problem.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
