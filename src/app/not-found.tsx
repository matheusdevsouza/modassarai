'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sand-100 flex items-center justify-center">
      <Link href="/">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[12rem] sm:text-[16rem] md:text-[20rem] lg:text-[24rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 cursor-pointer select-none leading-none transition-all duration-300 hover:from-primary-500 hover:via-primary-600 hover:to-primary-700"
        >
          404
        </motion.h1>
      </Link>
    </div>
  )
}
