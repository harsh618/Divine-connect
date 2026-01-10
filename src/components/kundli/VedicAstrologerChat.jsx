import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, User, Calendar, Clock, MapPin, Bot } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function VedicAstrologerChat({ userName, userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('name'); // name, dob, time, place, ready
  const [userData, setUserData] = useState({
    name: userName || '',
    birth_date: '',
    birth_time: '',
    birth_place: '',
    latitude: null,
    longitude: null,
    timezone: null
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      const greeting = {
        role: 'assistant',
        content: userName 
          ? `🕉️ Namaste ${userName}! I am Divine AI, your Vedic astrologer guide.\n\nBefore we dive into your cosmic journey, I need to fetch your birth chart. Let me gather some essential details from you.\n\n**What is your full name as per your birth certificate?**`
          : `🕉️ Namaste! I am Divine AI, your Vedic astrologer guide.\n\nBefore we dive into your cosmic journey, I need to fetch your birth chart. Let me gather some essential details from you.\n\n**What is your full name as per your birth certificate?**`,
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, []);

  const fetchLocationData = async (place) => {
    try {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY'}`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status !== 'OK' || !geocodeData.results.length) {
        throw new Error('Location not found. Please enter a valid place.');
      }

      const location = geocodeData.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;

      const timestamp = Math.floor(new Date().getTime() / 1000);
      const timezoneResponse = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY'}`
      );
      const timezoneData = await timezoneResponse.json();

      if (timezoneData.status !== 'OK') {
        throw new Error('Failed to fetch timezone data.');
      }

      const timezoneOffset = (timezoneData.rawOffset + timezoneData.dstOffset) / 3600;

      return { latitude, longitude, timezone: timezoneOffset.toString() };
    } catch (error) {
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let assistantResponse = '';

      if (stage === 'name') {
        setUserData(prev => ({ ...prev, name: input.trim() }));
        assistantResponse = `Beautiful! **${input.trim()}** - that's a wonderful name.\n\n**When were you born?**\nPlease provide your date of birth in DD-MM-YYYY format.\n\n*Example: 24-11-2001*`;
        setStage('dob');
      } 
      else if (stage === 'dob') {
        // Validate and parse date
        const dateRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
        const match = input.match(dateRegex);
        
        if (!match) {
          assistantResponse = `I need the date in **DD-MM-YYYY** format, like 24-11-2001.\n\nPlease try again:`;
          setLoading(false);
          setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse, timestamp: new Date() }]);
          return;
        }

        const [_, day, month, year] = match;
        const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        setUserData(prev => ({ ...prev, birth_date: birthDate }));
        assistantResponse = `Perfect! Born on **${day}-${month}-${year}**.\n\n**What time were you born?**\nPlease provide your birth time in 24-hour format (HH:MM).\n\n*Example: 03:20 or 15:45*\n\n*If you don't know the exact time, an approximate time works too.*`;
        setStage('time');
      } 
      else if (stage === 'time') {
        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        if (!timeRegex.test(input.trim())) {
          assistantResponse = `Please provide time in **HH:MM** format (like 03:20 or 15:45).\n\nTry again:`;
          setLoading(false);
          setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse, timestamp: new Date() }]);
          return;
        }

        setUserData(prev => ({ ...prev, birth_time: input.trim() }));
        assistantResponse = `Got it! Born at **${input.trim()}**.\n\n**Where were you born?**\nPlease provide your birthplace (City, State, Country).\n\n*Example: Deoria, Uttar Pradesh, India*`;
        setStage('place');
      } 
      else if (stage === 'place') {
        // Fetch location data
        toast.info('Fetching location coordinates...');
        try {
          const locationData = await fetchLocationData(input.trim());
          const updatedUserData = {
            ...userData,
            birth_place: input.trim(),
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timezone: locationData.timezone
          };
          setUserData(updatedUserData);
          
          assistantResponse = `Excellent! Birthplace: **${input.trim()}**\n\n✨ **Your cosmic coordinates are locked in!**\n\n📋 **Summary:**\n- Name: ${updatedUserData.name}\n- Birth Date: ${updatedUserData.birth_date}\n- Birth Time: ${updatedUserData.birth_time}\n- Birth Place: ${updatedUserData.birth_place}\n\n🔮 **Your birth chart is ready!** Ask me anything about your:\n- Life purpose & personality\n- Career & finances\n- Love & relationships\n- Health & well-being\n- Current planetary periods (Dasha)\n- Remedies & guidance\n\nWhat would you like to know?`;
          setStage('ready');
        } catch (error) {
          assistantResponse = `I couldn't find that location. Please provide a valid place name (City, State, Country).\n\nTry again:`;
          setLoading(false);
          setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse, timestamp: new Date() }]);
          return;
        }
      } 
      else if (stage === 'ready') {
        // Call the AI astrologer with full context
        const response = await base44.functions.invoke('vedicAstrologerChat', {
          user_data: userData,
          user_question: input
        });

        if (response.data.success) {
          assistantResponse = response.data.answer;
        } else {
          assistantResponse = 'I apologize, I encountered an issue. Please try asking again.';
        }
      }

      const assistantMessage = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to process message');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-gradient-to-b from-purple-50 to-white rounded-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold">Vedic Astrologer AI</h3>
          <p className="text-xs text-white/80">Ask me about your Kundali</p>
        </div>
        <div className="ml-auto flex gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-purple-100 text-gray-800'
              }`}
            >
              {message.role === 'assistant' ? (
                <ReactMarkdown
                  className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="text-purple-700 font-semibold">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-purple-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-purple-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Divine AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t rounded-b-xl">
        {stage !== 'ready' && (
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
            <div className={`flex items-center gap-1 ${stage === 'name' ? 'text-purple-600 font-medium' : ''}`}>
              <User className="w-3 h-3" />
              Name
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1 ${stage === 'dob' ? 'text-purple-600 font-medium' : ''}`}>
              <Calendar className="w-3 h-3" />
              DOB
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1 ${stage === 'time' ? 'text-purple-600 font-medium' : ''}`}>
              <Clock className="w-3 h-3" />
              Time
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1 ${stage === 'place' ? 'text-purple-600 font-medium' : ''}`}>
              <MapPin className="w-3 h-3" />
              Place
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1 ${stage === 'ready' ? 'text-green-600 font-medium' : ''}`}>
              <Sparkles className="w-3 h-3" />
              Ready
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              stage === 'name' ? 'Enter your full name...' :
              stage === 'dob' ? 'Enter date (DD-MM-YYYY)...' :
              stage === 'time' ? 'Enter time (HH:MM)...' :
              stage === 'place' ? 'Enter birthplace...' :
              'Ask me anything about your chart...'
            }
            disabled={loading}
            className="flex-1 h-12"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 h-12 px-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}