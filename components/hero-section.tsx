"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 bg-gradient-to-b from-background/[var(--gradient-opacity)] to-background/20" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Surf Sligo</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">Your ultimate Sligo surfing destination</p>
          <Link href="/spots">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Explore Spots
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

