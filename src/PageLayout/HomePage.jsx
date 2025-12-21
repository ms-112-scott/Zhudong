import React from 'react'
import { Section1 } from '../components/HomePage/Section1.jsx'
import { Section2 } from '../components/HomePage/Section2.jsx'
import { Section3 } from '../components/HomePage/Section3.jsx'

function HomePage() {
  return (
   <div className="min-h-screen w-full bg-surface text-fg font-sans selection:bg-main selection:text-main-light"> 
      {/* 1. Hero Section */}
      <Section1 />

      {/* 2. Problem & Solution */}
      <Section2 />

      {/* 3. Core Features */}
      <Section3 />

    </div>
  )
}

export default HomePage