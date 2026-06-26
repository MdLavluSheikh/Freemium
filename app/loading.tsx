import { Tv, Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center animate-pulse">
          <Tv className="w-6 h-6 text-white" />
        </div>
        <Loader2 className="w-6 h-6 text-red-500 mx-auto animate-spin" />
      </div>
    </div>
  )
}
