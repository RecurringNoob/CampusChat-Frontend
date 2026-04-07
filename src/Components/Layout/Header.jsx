import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
function Header()
{
  const authStatus = useSelector((state)=>state.auth.status);
  const navigate = useNavigate();
  return (
      <nav className="backdrop-blur-lg bg-zinc-900/70 sticky top-0 z-50 border-b border-zinc-800 py-4 px-6 flex justify-between items-center">
        <Link to="/">
        <Logo/>
        </Link>
        <div className="flex space-x-3">
          {!authStatus &&
          <>
          <button className="px-4 py-2 rounded-full text-zinc-300 hover:text-white text-sm" onClick={()=>navigate("/login")}>Log In</button>
          <button className="px-4 py-2 bg-emerald-500 rounded-full hover:bg-emerald-600 text-sm font-medium" onClick={()=>navigate("/signup")}>Sign Up</button>
          </>
          }
        </div>
      </nav>
      
  )
}
export default Header;