import React from 'react'

export default function Button({ children, className = "" }) {
  return (
    <button className={`px-4 py-2 text-white rounded-3xl font-semibold cursor-pointer ${className}`}>
      {children}
    </button>
  )
}
