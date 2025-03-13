"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative h-[calc(100vh-4rem)]">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/patrickltr-6ZuF6ZCvtJc-unsplash.jpg-dWxzLg9FXH93EaAYSxnjg1EPluj0L7.jpeg"
        alt="Calm ocean waters aerial view"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/30" />
      <div className="absolute inset-0 bg-black/20 dark:bg-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">Surf Sligo</h1>
          <p className="text-xl md:text-2xl mb-8 text-white drop-shadow-md">Your ultimate Sligo surfing destination</p>
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

