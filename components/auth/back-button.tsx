"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href: string;
  label: string;
}

export const BackButton = ({ href, label }: BackButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="my-6"
    >
      <Link
        href={href}
        className="
          group inline-flex items-center gap-2
          text-indigo-200 hover:text-white
          font-medium text-base
          transition-colors duration-200
          no-underline
        "
      >
        <span className="relative">
          {label}
          <span
            className="
              absolute left-0 -bottom-1 w-0 h-0.5 bg-white
              transition-all duration-300 ease-out
              group-hover:w-full
            "
          ></span>
        </span>
      </Link>
    </motion.div>
  );
};
