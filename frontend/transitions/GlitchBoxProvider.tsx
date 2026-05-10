"use client"
import { TransitionRouter } from 'next-transition-router'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const BLOCK_SIZE = 60

const GlitchBoxProvider = ({ children }: { children: React.ReactNode }) => {
    const transitionGridRef = useRef<HTMLDivElement>(null)
    const blockRef = useRef<HTMLDivElement[]>([])

    const createTransitionGrid = () => {
        const container = transitionGridRef.current;
        if (!container) return;

        container.innerHTML = ""
        blockRef.current = []

        const gridWidth = window.innerWidth;
        const gridHeight = window.innerHeight;
        const columns = Math.ceil(gridWidth / BLOCK_SIZE)
        const rows = Math.ceil(gridHeight / BLOCK_SIZE) + 1

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const block = document.createElement("div")
                block.className = "transition-block"
                block.style.cssText = `
                    position: absolute;
                    width: ${BLOCK_SIZE}px;
                    height: ${BLOCK_SIZE}px;
                    left:${col * BLOCK_SIZE}px;
                    top:${row * BLOCK_SIZE}px;
                    background-color: #000; /* Ensure this matches your transition theme */
                `;
                container.appendChild(block);
                blockRef.current.push(block);
            }
        }
        gsap.set(blockRef.current, { opacity: 0 })
    }

    useEffect(() => {
        createTransitionGrid();
        window.addEventListener("resize", createTransitionGrid);
        return () => window.removeEventListener("resize", createTransitionGrid)
    }, [])

    return (
        <TransitionRouter 
            auto
            leave={(next) => {
                gsap.to(blockRef.current, {
                    opacity: 1,
                    duration: 0.3,
                    stagger: { amount: 0.4, from: "random" },
                    onComplete: next, 
                })
            }}
            enter={(next) => {
                gsap.to(blockRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    stagger: { amount: 0.4, from: "random" },
                    onComplete: next,
                })
            }}
        >
            <div 
                ref={transitionGridRef} 
                className='transition-grid' 
                style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    zIndex: 9999, 
                    pointerEvents: 'none' 
                }} 
            />
            {children}
        </TransitionRouter>
    )
}

export default GlitchBoxProvider