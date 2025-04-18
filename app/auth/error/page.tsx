"use client"

import React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Error display component
function ErrorDisplay() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Unknown error'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 relative overflow-hidden"
    >
      {/* Animated glow background */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-pink-500/10 to-transparent rounded-2xl"
      />

      <h1 className="text-3xl font-extrabold text-center text-red-400 relative z-10">
        Xác thực thất bại
      </h1>
      <p className="mt-4 text-center text-base text-gray-200 relative z-10">
        {error}
      </p>

      <div className="mt-6 flex justify-center relative z-10">
        <Link href="/login">
          <Button
            variant="ghost"
            className="px-6 py-3 font-semibold text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-md hover:shadow-lg transition"
          >
            Quay lại đăng nhập
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

// Main page component
export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 rounded-4xl">
      <Suspense fallback={<div className="text-gray-400">Đang tải...</div>}>
        <ErrorDisplay />
      </Suspense>
    </div>
  )
}

// Ensure dynamic rendering
export const dynamic = 'force-dynamic'
