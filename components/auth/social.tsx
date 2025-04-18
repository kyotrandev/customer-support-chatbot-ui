"use client"

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, ease: 'easeOut', duration: 0.5 } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  hover: { scale: 1.05, boxShadow: '0 0 16px rgba(156, 163, 175, 0.6)' },
  tap: { scale: 0.95 },
};

export const Social = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full bg-white/5 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/10"
    >
      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            size="lg"
            variant="ghost"
            className="w-full flex items-center justify-center space-x-3 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent border border-transparent hover:bg-clip-border hover:border-gradient-to-r hover:from-cyan-400 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 relative overflow-hidden"
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-20 animate-pulse"
            />
            <FcGoogle className="h-6 w-6 relative z-10" />
            <span className="font-semibold text-gray-100 relative z-10">Google</span>
          </Button>
        </motion.div>

        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            size="lg"
            variant="ghost"
            className="w-full flex items-center justify-center space-x-3 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent border border-transparent hover:bg-clip-border hover:border-gradient-to-r hover:from-cyan-400 hover:to-purple-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 relative overflow-hidden"
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-20 animate-pulse"
            />
            <FaGithub className="h-6 w-6 relative z-10" />
            <span className="font-semibold text-gray-100 relative z-10">Github</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};