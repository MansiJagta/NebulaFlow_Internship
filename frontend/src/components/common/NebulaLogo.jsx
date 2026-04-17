import React from 'react';
import { motion } from 'framer-motion';

const NebulaLogo = ({ className = "w-10 h-10", animate = true }) => {
  return (
    <motion.div 
      className={`relative ${className} overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm shadow-xl flex items-center justify-center`}
      whileHover={animate ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <img 
        src="/logo.png?v=2" 
        alt="Logo" 
        className="w-[140%] h-[140%] object-cover object-top opacity-90 brightness-110"
        style={{
          // Offsets to center the circular part of the provided image
          marginTop: "-15%",
          marginLeft: "0%"
        }}
      />
      {/* Glossy overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default NebulaLogo;
