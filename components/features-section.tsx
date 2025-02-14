"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, WavesIcon as Wave } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2,
    },
  },
}

export function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { triggerOnce: true, threshold: 0.1 })

  return (
    <section className="py-20 bg-secondary/30">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="container mx-auto px-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Wave, title: "Surf Conditions", description: "Real-time updates on Sligo's wave conditions." },
            {
              icon: Calendar,
              title: "Local Events",
              description: "Stay updated on Sligo's surf competitions and meetups.",
            },
            { icon: MapPin, title: "Spot Finder", description: "Discover Sligo's best surfing locations." },
          ].map((feature, index) => (
            <motion.div key={index} variants={containerVariants}>
              <Card className="hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6 h-64 flex flex-col justify-between">
                  <div>
                    <feature.icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

