// src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAyurvedaPath, getYogaPath } from "./utils/pathUtils.js";
import navbarTranslations from "../translations/navbarTranslations"; // ✅ Translations

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut'
    }
  }
};

const Navbar = ({ lang = "en-IN", streak = 0 }) => {
  const navigate = useNavigate();
  const t = navbarTranslations[lang] || navbarTranslations["en-IN"];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-pink-200"
    >
      <motion.h1
        whileHover={{ scale: 1.05 }}
        className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-wide"
      >
        {t.title}
      </motion.h1>

      <div className="flex gap-4 items-center text-sm font-semibold text-gray-700">
        {streak > 0 && (
          <motion.span className="bg-yellow-100 text-rose-600 px-3 py-1 rounded-full shadow-sm"
            variants={pulseVariants}
            animate="pulse"
          >
            🔥 {streak} {t.dayStreak}
          </motion.span>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hover:text-pink-600"
          onClick={() => navigate("/dashboard")}
        >
          {t.dashboard || "Dashboard"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hover:text-pink-600"
          onClick={() => navigate("/journal")}
        >
          {t.journal}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hover:text-pink-600"
          onClick={() => navigate("/memory-vault")}
        >
          {t.memoryVault}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hover:text-pink-600"
          onClick={() => navigate(getAyurvedaPath())}
        >
          {t.ayurveda}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hover:text-pink-600"
          onClick={() => navigate(getYogaPath())}
        >
          {t.yoga}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full flex items-center justify-center hover:shadow-lg"
          onClick={() => navigate("/profile")}
        >
          👤
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
