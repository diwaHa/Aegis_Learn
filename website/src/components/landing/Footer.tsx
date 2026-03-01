"use client";

import { Github, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Architecture", href: "#architecture" },
    { label: "Chat Interface", href: "/chat" },
    { label: "Features", href: "#features" },
];

const resourceLinks = [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Privacy Policy", href: "#" },
];

const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
    return (
        <footer className="relative border-t border-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-red-accent/[0.02] to-transparent" />
            <div className="max-w-6xl mx-auto px-6 py-16 relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-red-accent flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <span className="text-lg font-bold">Aegis Learn</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Multi-Mode Intelligent AI Platform — privacy-first, cost-optimized, production-ready.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-white transition-colors inline-flex items-center gap-1"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            {resourceLinks.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-white transition-colors inline-flex items-center gap-1"
                                    >
                                        {link.label}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Contact</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Get in touch for enterprise licensing, custom deployments, or partnership inquiries.
                        </p>
                        <div className="flex items-center gap-2">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="w-9 h-9 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white/5 hover:border-red-accent/20 transition-all"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4 text-muted-foreground" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <Separator className="bg-white/5 mb-8" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Aegis Learn. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Built with FastAPI • Google Gemini • Next.js
                    </p>
                </div>
            </div>
        </footer>
    );
}
