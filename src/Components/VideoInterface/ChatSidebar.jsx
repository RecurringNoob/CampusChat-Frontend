import { useState } from "react";
import {X,Send} from 'lucide-react';
export const ChatSidebar = ({ messages, onSendMessage, onClose }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
<div className="w-full md:w-80 flex flex-col min-h-0 bg-zinc-800">
      <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
        <h3 className="font-bold">Chat</h3>
        <button onClick={onClose} className="md:hidden"><X size={18}/></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
<div
  className={`px-3 py-2 rounded-2xl max-w-[90%] ${
    msg.sender === "me"
      ? "bg-emerald-600 text-white"
      : "bg-zinc-700"
  }`}
>
  {msg.sender !== "me" && (
    <p className="text-[10px] text-zinc-400 mb-1">{msg.sender}</p>
  )}
  <p className="text-sm">{msg.text}</p>
</div>

            <span className="text-[10px] text-zinc-500 mt-1">{msg.time}</span>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-700">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Send a message..."
            className="w-full bg-zinc-900 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button onClick={handleSend} className="absolute right-2 top-1.5 text-emerald-500">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};