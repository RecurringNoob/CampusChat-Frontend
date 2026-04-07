import  {useState} from 'react'
import Card1 from "../Components/Card/Card1.jsx";
import {Video,User,Shield,Globe,Book,Music,Tv,Trophy} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import HeroContainer from '../Components/Container/HeroContainer.jsx';

function Home() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
      return (
        <>
        <HeroContainer>
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                <span>Students only. Verified spaces.</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Meet students from <span className="text-emerald-400">anywhere</span>, right now</h1>
              <p className="text-zinc-400 text-lg mb-8">Random video chats exclusively for verified college students. Make connections, find study partners, or just hang out - all with people who get student life.</p>
              
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="your university email" 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-full py-4 px-6 pr-36 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="absolute right-2 top-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 py-2 font-medium" onClick={()=>navigate("/signup",{state:{email:email}})}>
                  Join Now
                </button>
              </div>
            </div>
            
            <div className="relative w-full md:w-1/2">
              <div className="aspect-video bg-zinc-800 rounded-2xl overflow-hidden shadow-xl relative">
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl">
                    <Video className="text-emerald-400" size={48} />
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -bottom-8 -right-4 bg-zinc-800 p-4 rounded-2xl shadow-lg border border-zinc-700">
                <div className="flex items-center gap-3">
                <User className='text-emerald-400'/>
                  <div>
                    <p className="font-medium">Virat S</p>
                    <p className="text-xs text-zinc-400">LNMIIT</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -left-4 bg-zinc-800 p-4 rounded-2xl shadow-lg border border-zinc-700">
                <div className="flex items-center gap-3">
                <User className='text-emerald-400'/>
                  <div>
                    <p className="font-medium">Rohit K</p>
                    <p className="text-xs text-zinc-400">LNMIIT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </HeroContainer>
        {/* Second Section*/ }
        <div id="features" className="py-24 px-6 md:px-16 bg-gradient-to-b from-zinc-900 to-zinc-800">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need, <span className="text-emerald-400">nothing you don't</span></h2>
              <p className="text-zinc-400 max-w-xl mx-auto">We've stripped away the distractions to focus on what matters: making meaningful connections with fellow students.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <Card1>
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Students</h3>
              <p className="text-zinc-400">Every user is verified with their college email, ensuring you're only meeting other students.</p>
            </Card1>
            <Card1>
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Globe className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Student Network</h3>
              <p className="text-zinc-400">Connect with students from universities worldwide, expanding your perspective beyond campus.</p>
            </Card1>
            <Card1>
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Book className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Academic Filtering</h3>
              <p className="text-zinc-400">Find students in your major or courses for study partners and academic conversations.</p>
            </Card1>
            <Card1>
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Music className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Album Listening Parties</h3>
                <p className="text-zinc-400">Host or join synchronized music sessions where you can listen to albums together and chat about your favorite tracks in real-time.</p>
            </Card1>
            <Card1>
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Tv className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Match Watching Parties</h3>
                <p className="text-zinc-400">Never watch sports alone again! Sync up with fellow fans to watch and cheer for your favorite team together with live reactions.</p>
            </Card1>
            <Card1>
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Hosting Leaderboard</h3>
                <p className="text-zinc-400">Get recognized for creating engaging spaces. Top hosts earn badges and campus reputation points on our monthly leaderboards.</p>
            </Card1>
            </div>
            
          </div>
        
        
        </div>
        </>
        );
    
}

export default Home