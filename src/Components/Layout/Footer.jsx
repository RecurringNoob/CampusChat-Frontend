import Logo from './Logo'

function Footer() {
  return (
    <footer className="py-12 px-6 md:px-16 bg-zinc-950 border-t border-zinc-800">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12">
        <div className="mb-8 md:mb-0">
        <Logo/>
          <p className="text-zinc-500 max-w-xs mb-6">The safest way to connect with verified college students across the globe.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-zinc-400 hover:text-white">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-xs">in</span>
              </div>
            </a>
            <a href="#" className="text-zinc-400 hover:text-white">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-xs">tw</span>
              </div>
            </a>
            <a href="#" className="text-zinc-400 hover:text-white">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-xs">ig</span>
              </div>
            </a>
            <a href="#" className="text-zinc-400 hover:text-white">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-xs">tt</span>
              </div>
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4 text-sm text-zinc-300">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-zinc-500 hover:text-white">Features</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Security</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">For Teams</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-sm text-zinc-300">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-zinc-500 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Guides</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Events</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-sm text-zinc-300">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-zinc-500 hover:text-white">About</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Partners</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-sm text-zinc-300">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-zinc-500 hover:text-white">Privacy</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Terms</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Security</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white">Cookies</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-zinc-500 text-sm">© 2025 campuschat. All rights reserved.</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <a href="#" className="text-zinc-500 hover:text-white text-sm">Privacy Policy</a>
          <a href="#" className="text-zinc-500 hover:text-white text-sm">Terms of Service</a>
          <a href="#" className="text-zinc-500 hover:text-white text-sm">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
  )
}

export default Footer