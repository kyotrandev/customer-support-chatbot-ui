import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

interface HeaderProps {
  label: string
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full py-12 flex flex-col items-center justify-center gap-4 overflow-hidden"
    >
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-700/20 via-indigo-500/10 to-transparent pointer-events-none animate-pulse"
      />

      <h1
        className={cn(
          "text-4xl sm:text-5xl font-extrabold tracking-tight text-center",
          "bg-gradient-to-r from-sky-500 to-purple-600 bg-clip-text text-transparent",
          font.className
        )}
      >
        AI Chatbot
      </h1>

      {/* Animated underline */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '6rem' }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="h-1 bg-gradient-to-r from-sky-500 to-purple-600 rounded-full"
      />

      <p className="text-muted-foreground text-base sm:text-lg text-center max-w-md font-medium">
        {label}
      </p>
    </motion.div>
  )
}
