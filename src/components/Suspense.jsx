import React from 'react'
import Loader from './Loader'

export default function Suspense({ children }) {
  return (
    <React.Suspense fallback={<Loader />}>
      {children}
    </React.Suspense>
  )
}