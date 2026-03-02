"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Hand } from "lucide-react"

const images = [
    { id: 1, src: "/demo-images/virtual-try-on-clothes-online-02.jpg", alt: "Virtual Try-On 1" },
    { id: 2, src: "/demo-images/virtual-try-on-clothes-online-09.jpg", alt: "Virtual Try-On 2" },
    { id: 3, src: "/demo-images/virtual-try-on-clothes-online-kids-01.jpg", alt: "Virtual Try-On Kids 1" },
    { id: 4, src: "/demo-images/virtual-try-on-clothes-online-kids.jpg", alt: "Virtual Try-On Kids 2" }
]

const variants = {
    enter: (direction: number) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        }
    }
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
}

export default function SwipeableDemo() {
    const [[page, direction], setPage] = useState([0, 0])

    const imageIndex = Math.abs(page % images.length)

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection])
    }

    return (
        <section className="py-6 md:py-20 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between relative z-10 overflow-hidden gap-6 lg:gap-8">
            {/* Text Content (Left on Desktop) */}
            <div className="text-center lg:text-left lg:w-1/3 z-20">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 mb-6 uppercase tracking-widest">
                    Interactive Demo
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
                    Slide to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Explore</span>
                </h2>
                <p className="text-gray-400 font-medium max-w-sm mx-auto lg:mx-0 text-lg leading-relaxed">
                    Experience the realism. Swipe through our high-quality AI Try-On results and see the perfect fit, generated in seconds.
                </p>
            </div>

            {/* Slider Container (Right on Desktop) */}
            <div className="relative w-full lg:w-3/5 h-[65vh] lg:h-auto lg:aspect-video flex justify-center items-center mt-2 lg:mt-0">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x)

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1)
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1)
                            }
                        }}
                        className="absolute w-full h-full md:w-[95%] md:h-[95%] rounded-3xl md:rounded-[2rem] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing bg-transparent"
                    >
                        <img
                            src={images[imageIndex].src}
                            alt={images[imageIndex].alt}
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none filter drop-shadow-2xl"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Left/Right controls for desktop */}
                <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-10 z-20 hidden md:flex">
                    <button
                        className="p-3 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all shadow-lg hover:scale-110 active:scale-95"
                        onClick={() => paginate(-1)}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 right-6 md:right-10 z-20 hidden md:flex">
                    <button
                        className="p-3 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all shadow-lg hover:scale-110 active:scale-95"
                        onClick={() => paginate(1)}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>

                {/* Dots indicator */}
                <div className="absolute bottom-10 flex items-center justify-center gap-2 w-full z-20">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === imageIndex ? "w-8 bg-blue-500" : "w-2 bg-white/20 hover:bg-white/40 cursor-pointer"
                                }`}
                            onClick={() => {
                                setPage([idx, idx > imageIndex ? 1 : -1])
                            }}
                        />
                    ))}
                </div>

                {/* Hand icon to suggest swiping */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: -20 }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute bottom-20 md:hidden z-50 flex flex-col items-center pointer-events-none"
                >
                    <Hand className="h-6 w-6 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] rotate-[-15deg]" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 animate-pulse">Swipe</span>
                </motion.div>
            </div>
        </section>
    )
}
