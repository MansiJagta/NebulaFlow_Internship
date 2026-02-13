import { useMemo } from 'react';
import { motion } from 'framer-motion';

const ParticleBackground = () => {
    const particles = useMemo(() =>
        Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.5 + 0.1,
        })), []
    );

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Nebula gradient background */}
            <div className="absolute inset-0" style={{
                background: `
          radial-gradient(ellipse at 20% 50%, hsl(257 100% 68% / 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, hsl(187 100% 50% / 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, hsl(340 100% 65% / 0.08) 0%, transparent 50%),
          hsl(230 60% 11%)
        `
            }} />

            {/* Particles */}
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        background: p.id % 3 === 0
                            ? 'hsl(187 100% 50%)'
                            : p.id % 3 === 1
                                ? 'hsl(257 100% 68%)'
                                : 'hsl(340 100% 65%)',
                        opacity: p.opacity,
                    }}
                    animate={{
                        y: [0, -30, 10, -20, 0],
                        x: [0, 15, -10, 5, 0],
                        opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.5, p.opacity * 1.2, p.opacity],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
};

export default ParticleBackground;
