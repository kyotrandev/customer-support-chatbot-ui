"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface BackButtonProps {
  href: string;
  label: string;
}

export const BackButton = ({ href, label }: BackButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex justify-center mt-4"
    >
      <Link
        href={href}
        className="
          flex items-center justify-center gap-2
          w-full max-w-xs
          px-6 py-3
          bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500
          text-white text-sm font-medium
          rounded-full
          shadow-lg
          transform transition
          hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-indigo-400/50
        "
      >
        <ArrowLeft className="w-5 h-5" />
        {label}
      </Link>
    </motion.div>
  );
};
