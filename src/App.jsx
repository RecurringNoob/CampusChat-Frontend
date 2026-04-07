import { Outlet } from 'react-router-dom'
import {Header,Footer,DashboardNavigation} from "./Components/index.js";
import { useSelector } from 'react-redux';
import './App.css'

function App() {
  
  const authStatus = useSelector((state)=>state.auth.status);
  return (
    
     <div className="min-h-screen bg-zinc-900 text-white">
    {authStatus ? <DashboardNavigation/>:<Header/>}
    <main>
    <Outlet/>
    </main>
    <Footer/>
    </div>
  
  )
}

export default App
