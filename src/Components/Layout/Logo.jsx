import React from 'react'
import {
Video
} from 'lucide-react'

function Logo({onClick}) {
  return (
    <div className="flex items-center space-x-2" onClick={onClick}>  
                <Video className="text-emerald-400" size={24} />
                <span className="text-lg font-bold">campus<span className="text-emerald-400">chat</span></span>
  </div>
  )
}

export default Logo