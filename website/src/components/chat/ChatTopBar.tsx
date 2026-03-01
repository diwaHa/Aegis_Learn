"use client";

import { LogOut, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Mode, modeConfig } from "@/types/chat";

interface ChatTopBarProps {
    mode: Mode;
    sidebarContent: React.ReactNode;
}


export default function ChatTopBar({ mode, sidebarContent }: ChatTopBarProps) {

    const ModeIcon = modeConfig[mode].icon;

    return (
        <header className="h-14 border-b border-white/5 bg-card/20 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
                {/* Mobile menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="lg:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Menu className="w-4 h-4" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0 bg-card border-white/5">
                        {/* provide an accessible title for the dialog */}
                        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                        {sidebarContent}
                    </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                    <ModeIcon className={`w-5 h-5 ${modeConfig[mode].color}`} />
                    <span className="font-medium text-sm">{modeConfig[mode].label}</span>
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                        {modeConfig[mode].description}
                    </Badge>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-red-accent/10 text-[10px] font-bold text-red-accent">
                        AL
                    </AvatarFallback>
                </Avatar>
                <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-colors group">
                    <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-400" />
                </button>
            </div>
        </header>
    );
}

