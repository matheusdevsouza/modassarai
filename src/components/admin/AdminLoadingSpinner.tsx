'use client'

export default function AdminLoadingSpinner() {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-2 border-transparent border-b-primary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
    </div>
  )
}

