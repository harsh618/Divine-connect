import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgentAssistChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Namaste! 🙏 I\'m your Divine Assistant powered by AI. I can help you with temples, poojas, astrology, priests, donations, and yatra planning based on our platform data. How can I assist you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await base44.functions.invoke('divineAssistant', { message: userMessage });
      setMessages(prev => [...prev, { type: 'bot', text: response.data.reply }]);
    } catch (error) {
      console.error('Assistant error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment. 🙏' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform animate-pulse"
        >
          <MessageCircle className="w-7 h-7" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-8 right-8 z-50 w-96 h-[500px] shadow-2xl border-2 border-amber-500/30 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Divine Assistant</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/90">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.type === 'user' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                size="icon"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}