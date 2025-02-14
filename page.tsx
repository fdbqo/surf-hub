"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, WavesIcon as Wave } from "lucide-react"

export default function Home() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

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

  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="relative h-screen">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-YyXDzzeoB8pi4q2YE95bI7pqADHrjQ.png"
          alt="Ocean waves aerial view"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Catch Your Perfect Wave</h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">Your ultimate surfing destination awaits</p>
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
              Start Your Journey
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="container mx-auto px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={containerVariants}>
              <Card className="hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm border-teal-500/20">
                <CardContent className="p-6 h-64 flex flex-col justify-between">
                  <div>
                    <Wave className="w-12 h-12 text-teal-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Surf Conditions</h3>
                    <p className="text-muted-foreground">
                      Real-time updates on wave height, wind direction, and tide conditions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={containerVariants}>
              <Card className="hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm border-teal-500/20">
                <CardContent className="p-6 h-64 flex flex-col justify-between">
                  <div>
                    <Calendar className="w-12 h-12 text-teal-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Surf Lessons</h3>
                    <p className="text-muted-foreground">
                      Book lessons with experienced instructors for all skill levels.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={containerVariants}>
              <Card className="hover:shadow-lg transition-shadow bg-background/50 backdrop-blur-sm border-teal-500/20">
                <CardContent className="p-6 h-64 flex flex-col justify-between">
                  <div>
                    <MapPin className="w-12 h-12 text-teal-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Spot Finder</h3>
                    <p className="text-muted-foreground">Discover the best surfing locations in your area.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Featured Image Section */}
      <section className="relative h-[600px]">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kKW36QlDpr7GgP1PHwAcRIwvNitioY.png"
          alt="Perfect wave barrel"
          fill
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/20" />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Experience the Thrill</h2>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-black">
              View Surf Spots
            </Button>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-900/20 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Ride the Waves?</h2>
          <p className="text-xl mb-8 text-teal-100">Join our community of surfers and start your adventure today.</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
              Sign Up Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

