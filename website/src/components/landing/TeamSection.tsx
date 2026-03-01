"use client";

import { motion } from "framer-motion";
import { Github, Linkedin } from "lucide-react";

const team = [
    {
        name: "Team Lead",
        role: "Architecture & Backend",
        initials: "TL",
        github: "#",
        linkedin: "#",
    },
    {
        name: "AI Engineer",
        role: "LLM Integration & NLP",
        initials: "AI",
        github: "#",
        linkedin: "#",
    },
    {
        name: "Security Engineer",
        role: "Privacy & Compliance",
        initials: "SE",
        github: "#",
        linkedin: "#",
    },
    {
        name: "Full Stack Dev",
        role: "Frontend & DevOps",
        initials: "FS",
        github: "#",
        linkedin: "#",
    },
];

export default function TeamSection() {
    return (
        <section id="team" className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        The <span className="text-red-accent">Team</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto italic">
                        &ldquo;We are building AI infrastructure, not just AI applications.&rdquo;
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {team.map((member, i) => (
                        <motion.div
                            key={member.name}
                            className="group text-center p-6 rounded-2xl border border-white/5 bg-card/30 hover:border-red-accent/15 transition-all duration-300 hover:scale-[1.02]"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            {/* Avatar placeholder */}
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-accent/20 to-red-accent/5 border border-red-accent/10 flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl font-bold text-red-accent">{member.initials}</span>
                            </div>
                            <h3 className="font-semibold mb-1">{member.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{member.role}</p>
                            <div className="flex items-center justify-center gap-3">
                                <a
                                    href={member.github}
                                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <Github className="w-4 h-4 text-muted-foreground" />
                                </a>
                                <a
                                    href={member.linkedin}
                                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
