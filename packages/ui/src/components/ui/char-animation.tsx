"use client";

import { cn } from '../../lib/utils'
import { motion } from 'motion/react'

interface CharAnimationProps {
    text: string
    className?: string
}

const CharAnimation = ({ text, className }: CharAnimationProps) => {
    const animate = () => {
        const chars = [...text]
        return (
            <>
                {chars.map((char, index) => (
                    <motion.span
                        key={index}
                        initial={{fontWeight: 600}}
                        animate={{fontWeight: [600, 1000, 600]}}
                        transition={{
                            duration: 2,
                            ease: "easeInOut",
                            delay: index * 0.2,
                            repeat: Infinity,
                            repeatDelay: 2
                        }}
                        className='inline-block tracking-tight font-serif'
                    >
                        {char}
                    </motion.span>
                ))}
            </>
        )
    }
    
    return (
        <motion.span
            className={cn('inline-block text-white', className)}
        >
            {animate()}
        </motion.span>
    )
}
export default CharAnimation;