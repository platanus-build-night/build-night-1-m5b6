"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PlusIcon, MinusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import type { Category } from "@/lib/types"
import ArticlePreview from "./article-preview"

interface GraphModeProps {
  categories: Category[]
}

interface Node {
  id: string
  name: string
  x: number
  y: number
  radius: number
  color: string
  gradient: string
}

export default function GraphMode({ categories }: GraphModeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Initialize nodes
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        const canvas = canvasRef.current

        // Set high-resolution canvas for retina displays
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        setDimensions({ width, height })

        // Create nodes based on categories in a circular arrangement
        const newNodes = categories.map((category, index) => {
          const angle = (index / categories.length) * Math.PI * 2
          const radius = Math.min(width, height) * 0.3
          return {
            id: category.id,
            name: category.name,
            x: width / 2 + Math.cos(angle) * radius,
            y: height / 2 + Math.sin(angle) * radius,
            radius: 60,
            color: getCategoryColor(category),
            gradient: category.gradient,
          }
        })
        setNodes(newNodes)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [categories])

  // Draw the graph
  const drawGraph = useCallback(() => {
    if (!canvasRef.current || nodes.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply device pixel ratio for retina displays
    const dpr = window.devicePixelRatio || 1
    ctx.scale(dpr, dpr)

    // Apply current transform
    ctx.save()
    ctx.translate(transform.x, transform.y)
    ctx.scale(transform.scale, transform.scale)

    // Draw connections first (behind nodes)
    ctx.beginPath()
    ctx.strokeStyle = "rgba(200, 200, 200, 0.15)"
    ctx.lineWidth = 1

    // Draw connections between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        ctx.beginPath()
        ctx.moveTo(nodes[i].x, nodes[i].y)
        ctx.lineTo(nodes[j].x, nodes[j].y)
        ctx.stroke()
      }
    }

    // Draw nodes
    nodes.forEach((node) => {
      const isHovered = hoveredNode === node.id

      // Create gradient for node
      const gradientRadius = isHovered ? node.radius * 1.1 : node.radius
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, gradientRadius)

      // Parse gradient colors
      const gradientMatch = node.gradient.match(/(#[0-9a-f]{6}|rgba?$$[^)]+$$)/gi)
      if (gradientMatch && gradientMatch.length >= 2) {
        gradient.addColorStop(0, gradientMatch[0])
        gradient.addColorStop(1, gradientMatch[1] + "80") // Add transparency
      } else {
        gradient.addColorStop(0, node.color)
        gradient.addColorStop(1, node.color + "20")
      }

      // Draw node with gradient
      ctx.beginPath()
      ctx.fillStyle = gradient

      // Add subtle pulsing effect to hovered node
      const nodeRadius = isHovered ? node.radius * (1 + Math.sin(Date.now() * 0.005) * 0.05) : node.radius

      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
      ctx.fill()

      // Add subtle glow effect for hovered node
      if (isHovered) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius + 5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
        ctx.fill()
      }

      // Draw node text
      ctx.fillStyle = "#fff"
      ctx.font = `${isHovered ? "bold " : ""}14px SF Pro, system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.name, node.x, node.y)
    })

    ctx.restore()
  }, [nodes, transform, hoveredNode])

  // Animation loop
  useEffect(() => {
    let animationId: number

    const animate = () => {
      drawGraph()
      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [drawGraph])

  // Handle mouse/touch interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDragging(true)
    setStartDragPos({ x: e.clientX - transform.x, y: e.clientY - transform.y })
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      e.preventDefault()
      setIsDragging(true)
      setStartDragPos({
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    // Calculate mouse position relative to canvas and accounting for transform
    const mouseX = (e.clientX - rect.left - transform.x) / transform.scale
    const mouseY = (e.clientY - rect.top - transform.y) / transform.scale

    // Check if mouse is over any node
    const hovered = nodes.find((node) => {
      const dx = node.x - mouseX
      const dy = node.y - mouseY
      return Math.sqrt(dx * dx + dy * dy) < node.radius
    })

    setHoveredNode(hovered ? hovered.id : null)

    // Handle dragging
    if (isDragging) {
      setTransform({
        ...transform,
        x: e.clientX - startDragPos.x,
        y: e.clientY - startDragPos.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault()
      setTransform({
        ...transform,
        x: e.touches[0].clientX - startDragPos.x,
        y: e.touches[0].clientY - startDragPos.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Handle canvas click to select node
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return // Don't select if we were dragging

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    // Calculate click position accounting for transform
    const clickX = (e.clientX - rect.left - transform.x) / transform.scale
    const clickY = (e.clientY - rect.top - transform.y) / transform.scale

    // Check if a node was clicked
    const clickedNode = nodes.find((node) => {
      const dx = node.x - clickX
      const dy = node.y - clickY
      return Math.sqrt(dx * dx + dy * dy) < node.radius
    })

    if (clickedNode) {
      const category = categories.find((cat) => cat.id === clickedNode.id)
      setSelectedCategory(category || null)
    }
  }

  // Handle zoom
  const handleZoom = (delta: number) => {
    setTransform((prev) => {
      const newScale = Math.max(0.5, Math.min(2.5, prev.scale + delta * 0.1))
      return { ...prev, scale: newScale }
    })
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1
    handleZoom(delta)
  }

  // Reset transform
  const resetView = () => {
    setTransform({ scale: 1, x: 0, y: 0 })
  }

  // Helper to get a color from category gradient
  function getCategoryColor(category: Category): string {
    const match = category.gradient.match(/(#[0-9a-f]{6}|rgba?$$[^)]+$$)/i)
    return match ? match[0] : "#888888"
  }

  return (
    <div className="w-full h-[70vh] relative" ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(1)}
          className="bg-white/90 dark:bg-black/90 rounded-full p-2 shadow-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
          aria-label="Zoom in"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="bg-white/90 dark:bg-black/90 rounded-full p-2 shadow-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
          aria-label="Zoom out"
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <button
          onClick={resetView}
          className="bg-white/90 dark:bg-black/90 rounded-full p-2 shadow-sm hover:bg-white dark:hover:bg-gray-900 transition-colors mt-2"
          aria-label="Reset view"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
            <path d="M12 8v4l2 2" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-md px-3 py-2">
        <p>Drag to pan • Scroll to zoom • Click node to view articles</p>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{
          touchAction: "none",
          cursor: hoveredNode ? "pointer" : isDragging ? "grabbing" : "grab",
        }}
      />

      {/* Selected Category Overlay */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-white dark:bg-black bg-opacity-95 dark:bg-opacity-95 p-6 overflow-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full mr-3"
                  style={{
                    background: selectedCategory.gradient,
                    backgroundSize: "200% 200%",
                    animation: "gradientMove 8s ease infinite",
                  }}
                />
                <h3 className="text-2xl font-medium">{selectedCategory.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory.articles.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.1,
                  }}
                >
                  <ArticlePreview article={article} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
