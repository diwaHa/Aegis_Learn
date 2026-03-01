"use client";

import dynamic from "next/dynamic";

const ChatPageContent = dynamic(() => import("./ChatPageContent"), {
  ssr: false,
});

export default function ChatClientWrapper() {
  return <ChatPageContent />;
}