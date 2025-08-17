'use client'

import { useState, useEffect } from 'react'
import BackgroundLoader from '../../components/BackgroundLoader'
import Header from '../../components/Header'

export default function AboutPage() {
  const [profileImage, setProfileImage] = useState('/uploads/profile-placeholder.svg')

  useEffect(() => {
    loadProfileImage()
  }, [])

  const loadProfileImage = async () => {
    try {
      const response = await fetch('/api/settings/profile-image')
      if (response.ok) {
        const data = await response.json()
        setProfileImage(data.profileImage)
      }
    } catch (error) {
      console.error('Error loading profile image:', error)
    }
  }

  return (
    <>
      <BackgroundLoader />
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 pt-20 pb-16">
      <img 
        src={profileImage}
        alt="Illustrator Photo"
        className="w-[300px] h-[300px] object-cover rounded-full"
      />
      
      <h1 className="text-[28px] font-bold text-white">
        Rachmad Aditia Prayudhi Wardhana
      </h1>
      
      <p className="text-[20px] text-[#ccc]">
        Illustrator
      </p>
      
      <h2 className="text-[22px] font-semibold mt-5 text-white">
        About
      </h2>
      
      <p className="text-[16px] text-white max-w-[600px] text-center">
        Saya seorang ilustrator dengan pengalaman membuat karya digital dan tradisional. Berpengalaman dalam proyek ilustrasi untuk media sosial, brand, hingga komisi personal. Passion saya adalah bercerita melalui visual yang unik, penuh warna, dan menyampaikan pesan dengan kuat.
      </p>
      
      {/* Social Media Section */}
       <div className="flex gap-6 mt-8 mb-16 justify-center">
         {/* Instagram */}
         <a 
           href="https://www.instagram.com/kang.didit/" 
           target="_blank" 
           rel="noopener noreferrer"
           className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg"
           title="Instagram"
         >
           <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
           </svg>
         </a>
         
         {/* Behance */}
         <a 
           href="https://www.behance.net/seratusstudio" 
           target="_blank" 
           rel="noopener noreferrer"
           className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg"
           title="Behance"
         >
           <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.76-.62.16-1.25.24-1.89.24H0V4.51h6.938v-.007zM3.495 8.21h2.563c.62 0 1.11-.89 1.45-.267.34-.378.51-.86.51-1.45 0-.59-.17-1.07-.51-1.45-.34-.378-.83-.567-1.45-.567H3.495v3.734zm0 7.32h2.668c.71 0 1.29-.2 1.74-.594.45-.394.68-.95.68-1.67 0-.72-.23-1.27-.68-1.66-.45-.39-1.03-.59-1.74-.59H3.495v4.51zM21.5 14.4c0 .66-.1 1.14-.3 1.44-.2.3-.45.44-.75.44-.3 0-.55-.14-.75-.44-.2-.3-.3-.78-.3-1.44v-2.4c0-.66.1-1.14.3-1.44.2-.3.45-.44.75-.44.3 0 .55.14.75.44.2.3.3.78.3 1.44v2.4zm-1.05-7.9c-.75 0-1.39.09-1.91.26s-.94.42-1.25.73c-.31.31-.54.68-.69 1.1-.15.42-.225.87-.225 1.35v4.2c0 .48.075.93.225 1.35.15.42.38.79.69 1.1.31.31.73.55 1.25.73.52.17 1.16.26 1.91.26.75 0 1.39-.09 1.91-.26s.94-.42 1.25-.73c.31-.31.54-.68.69-1.1.15-.42.225-.87.225-1.35v-4.2c0-.48-.075-.93-.225-1.35-.15-.42-.38-.79-.69-1.1-.31-.31-.73-.55-1.25-.73-.52-.17-1.16-.26-1.91-.26zm-2.6-2.4h5.2v1.2h-5.2v-1.2z"/>
           </svg>
         </a>
         
         {/* Email */}
         <a 
           href="mailto:kangdidittt@gmail.com" 
           className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg"
           title="Email"
         >
           <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
           </svg>
         </a>
       </div>
      </div>
    </>
  )
}