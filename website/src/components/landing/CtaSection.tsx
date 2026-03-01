"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CtaSection() {
    return (
        <section className="py-32 px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-accent/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                className="max-w-3xl mx-auto text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Ready to Experience{" "}
                    <span className="bg-gradient-to-r from-red-accent to-red-accent-light bg-clip-text text-transparent">
                        Aegis Learn
                    </span>
                    ?
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                    Try the multi-mode AI platform that puts privacy, compliance, and cost optimization first.
                </p>
                <Link href="/chat">
                    <Button
                        size="lg"
                        className="bg-red-accent hover:bg-red-accent-dark text-white px-10 py-7 text-lg rounded-2xl shadow-lg shadow-red-accent/20 hover:shadow-red-accent/40 transition-all duration-300 group"
                    >
                        Launch AI Interface
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </motion.div>
        </section>
    );
}
