function HeroContainer({children}) {
  return (
    <>
    <div className="relative overflow-hidden pt-24 pb-32 px-6 md:px-16">
    <div className="absolute top-0 left-1/2 w-1/3 h-1/3 bg-emerald-500/20 rounded-full blur-3xl -translate-x-1/2"></div>
    <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-purple-500/20 rounded-full blur-3xl"></div>
    
    <div className="max-w-6xl mx-auto">
    {children}
    </div>
    </div>
    </>

  );
}

export default HeroContainer;