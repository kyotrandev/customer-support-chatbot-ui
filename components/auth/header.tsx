import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const font = Poppins({
  subsets: ["latin"],
  weight: ["500", "700"],
})

interface HeaderProps {
  label: string
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full pt-8 pb-6 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Modern background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 left-1/4 w-24 h-24 rounded-full bg-blue-500/10 blur-xl" />
        <div className="absolute bottom-8 right-1/3 w-32 h-32 rounded-full bg-purple-500/10 blur-xl" />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h1
          className={cn(
            "text-2xl font-bold",
            "bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent",
            font.className
          )}
        >
          Sen Chatbot
        </h1>
      </div>

      {/* Minimalist descriptor */}
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-gray-300 text-sm text-center max-w-xs"
      >
        {label}
      </motion.p>

      {/* Simple bottom line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="h-px w-16 bg-gradient-to-r from-transparent via-purple-400 to-transparent mt-4"
      />
    </motion.div>
  )
}