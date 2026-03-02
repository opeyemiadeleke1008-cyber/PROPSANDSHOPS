import { MoveRight, MoveRightIcon } from 'lucide-react'
import React from 'react'

export default function Newsletter() {
  return (
    <div className='bg-black/95 text-white py-20 flex flex-col gap-5'>
      <h1 className='text-3xl font-bold text-center mb-4' style={{ fontFamily: '"Orbitron"' }}>Newsletter</h1>
      <h3 className='text-xl font-bold text-center'>Join Our World</h3>
      <p className='text-center'>Be the first to discover new collections, artisan stories, and exclusive invitations.</p>
      <div className='flex gap-6 justify-center mt-6 items-center w-[90%] mx-auto md:flex-row flex-col'>
        <input type="email" placeholder='Email' className='border p-2 border-gray-100 text-white font-semibold text-md ring-0 outline-none placeholder:text-md w-90'/>
        <button className='flex gap-2 cursor-pointer items-center bg-white/30 py-2 px-4'>
            Subscribe
            
        </button>
      </div>
    </div>
  )
}
