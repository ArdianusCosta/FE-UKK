"use client"

import React, { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    color: string
}

export const InteractiveParticles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []
        const particleCount = 80

        const resizeCanvas = () => {
            if (typeof window !== 'undefined') {
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
                initParticles()
            }
        }

        const initParticles = () => {
            particles = []
            // Use colors matching the theme (purples and blues)
            const colors = [
                'rgba(139, 92, 246, 0.4)', // Violet 500
                'rgba(59, 130, 246, 0.4)',  // Blue 500
                'rgba(168, 85, 247, 0.4)', // Purple 500
                'rgba(37, 99, 235, 0.4)',  // Blue 600
            ]

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.8,
                    speedY: (Math.random() - 0.5) * 0.8,
                    color: colors[Math.floor(Math.random() * colors.length)],
                })
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((p) => {
                // Default movement
                p.x += p.speedX
                p.y += p.speedY

                // Mouse interaction - particles are attracted slightly to mouse
                const dx = mouseRef.current.x - p.x
                const dy = mouseRef.current.y - p.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const forceRange = 250

                if (distance < forceRange) {
                    const force = (forceRange - distance) / forceRange
                    // Move towards mouse with more strength
                    p.x += dx * force * 0.03
                    p.y += dy * force * 0.03
                }

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width
                if (p.x > canvas.width) p.x = 0
                if (p.y < 0) p.y = canvas.height
                if (p.y > canvas.height) p.y = 0

                // Draw particle
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = p.color
                ctx.fill()
            })

            // Draw interaction lines
            ctx.shadowBlur = 0
            for (let i = 0; i < particles.length; i++) {
                // Lines to mouse
                const dxm = mouseRef.current.x - particles[i].x
                const dym = mouseRef.current.y - particles[i].y
                const distM = Math.sqrt(dxm * dxm + dym * dym)

                if (distM < 180) {
                    ctx.beginPath()
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.25 * (1 - distM / 180)})`
                    ctx.lineWidth = 0.8
                    ctx.moveTo(particles[i].x, particles[i].y)
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y)
                    ctx.stroke()
                }

                // Lines between particles
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 100) {
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 100)})`
                        ctx.lineWidth = 0.5
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }

        window.addEventListener('resize', resizeCanvas)
        window.addEventListener('mousemove', handleMouseMove)

        resizeCanvas()
        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.8 }}
        />
    )
}
