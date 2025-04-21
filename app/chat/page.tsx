"use client";

import ChatInterface from "@/components/chat/chat-interface";
import { useTranslation } from "react-i18next";
import HeaderHome from '@/components/Homepage/Header';
import NavBarHome from '@/components/Homepage/Navbar';

export default function Home({ session }: { session: any }) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      {/* Navbar */}
      <NavBarHome session={session} />

      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t("welcome")}</h1>
        <ChatInterface session={session}/>
      </div>
    </main>
  );
}
