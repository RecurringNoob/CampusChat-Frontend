import React from "react";
import { Search } from "lucide-react";

export function SearchBar()
{
  return(
    <>
      <div className="hidden md:flex relative mx-auto w-1/3">
        <input
          type="text"
          placeholder="Search students, topics..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-full py-2 px-5 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
        <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
      </div>
      
    </>
  )
}