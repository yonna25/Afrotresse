import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// Imports des pages
import Home from './pages/Home.jsx'
import Camera from './pages/Camera.jsx'
import Analyze from './pages/Analyze.jsx'
import Results from './pages/Results.jsx' // <--- Vérifiez bien la majuscule ici !
import Library from './pages/Library.jsx'
import Profile from './pages/Profile.jsx'
import Credits from './pages/Credits.jsx'
import BottomNav from './components/BottomNav.jsx'

// ... (reste du code de App.jsx)
