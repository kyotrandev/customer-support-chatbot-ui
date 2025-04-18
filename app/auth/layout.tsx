"use client"
import React from 'react'
import { motion } from 'framer-motion'

const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    x: [0, 20, 0],
    transition: {
      duration: 8,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 overflow-hidden relative p-4"
    >
      {/* Floating decor circles */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-0 left-0 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ originX: 1, originY: 1 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
      />

      {/* Auth card container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col gap-6 overflow-hidden"
      >
        {/* Shimmer glass highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 4, duration: 2 }}
          className="absolute -top-16 -right-16 w-40 h-40 bg-white/30 rounded-full blur-2xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 5, duration: 3 }}
          className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/20 rounded-full blur-2xl"
        />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'backOut' }}
          className="flex justify-center"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center drop-shadow-lg">
            <span className="text-white text-2xl font-bold">AI</span>
          </div>
        </motion.div>

        {children}
      </motion.div>
    </motion.div>
  )
}

export default AuthLayout