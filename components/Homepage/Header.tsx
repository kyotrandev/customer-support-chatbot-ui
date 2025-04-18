import { assets } from "@/assets/assets";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import { ArrowRight, Bot } from "lucide-react";
import Link from "next/link";

const HeaderHome = ({ session }: { session: Session | null }) => {
  const displayName = session?.user?.username || "Explorer";
  
  return (
    <div className="flex flex-col items-center pt-16 px-4 text-center space-y-8">
      {/* Animated greeting with user's name */}
      {session && (
        <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 animate-fadeIn">
          <span className="text-lg">Hey {displayName}</span>
          <div className="w-6 h-6 relative">
            <Image
              src={assets.hand_wave}
              alt="Wave"
              fill
              className="object-contain animate-wave"
            />
          </div>
        </div>
      )}
      
      {/* Main headline */}
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-tight">
        Experience the{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
          Next Generation
        </span>{" "}
        of AI Chatbot
      </h1>
      
      {/* Subheading */}
      <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto font-light">
        Intelligent conversations, creative assistance, and powerful insights at your fingertips
      </p>
      
      {/* CTA Button */}
      {session ? (
        <Link href="/chat">
          <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-full px-8 py-6 text-lg mt-6 group transition-all">
            Start Chatting
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      ) : (
        <Link href="/auth/login">
          <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-full px-8 py-6 text-lg mt-6 group transition-all">
            Try It Now
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}
      
      {/* Animated bot icon */}
      <div className="relative w-48 h-48 mt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative w-full h-full bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
          <Bot className="w-20 h-20 text-indigo-300" />
        </div>
      </div>
    </div>
  );
};

export default HeaderHome;