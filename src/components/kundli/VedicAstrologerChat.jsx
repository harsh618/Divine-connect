import React, { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, User, Calendar, Clock, MapPin, Bot, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import debounce from 'lodash/debounce';

export default function VedicAstrologerChat({ userName, userId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('loading'); // loading, name, dob, time, place, ready
  const [userData, setUserData] = useState({
    name: '',
    birth_date: '',
    birth_time: '',
    birth_place: '',
    latitude: null,
    longitude: null,
    timezone: null
  });
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user's saved astrology profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Check if user has saved kundli data
        const kundlis = await base44.entities.Kundli.filter({ 
          user_id: userId, 
          is_deleted: false 
        }, '-created_date', 1);

        if (kundlis && kundlis.length > 0) {
          const savedKundli = kundlis[0];
          const loadedData = {
            name: savedKundli.name || userName || '',
            birth_date: savedKundli.birth_date || '',
            birth_time: savedKundli.birth_time || '',
            birth_place: savedKundli.birth_place || '',
            latitude: savedKundli.latitude,
            longitude: savedKundli.longitude,
            timezone: savedKundli.timezone_str
          };
          setUserData(loadedData);

          // If we have all required data, skip to ready stage
          if (loadedData.birth_date && loadedData.birth_time && loadedData.birth_place && loadedData.latitude) {
            setStage('ready');
            const greeting = {
              role: 'assistant',
              content: `🕉️ Namaste ${loadedData.name}! Welcome back!\n\nI have your birth chart details:\n- **Date:** ${formatDate(loadedData.birth_date)}\n- **Time:** ${loadedData.birth_time}\n- **Place:** ${loadedData.birth_place}\n\n🔮 Your cosmic profile is ready! Ask me anything about your:\n- Life purpose & personality\n- Career & finances\n- Love & relationships\n- Health & well-being\n- Current planetary periods (Dasha)\n- Remedies & guidance\n\nWhat would you like to know?`,
              timestamp: new Date()
            };
            setMessages([greeting]);
          } else {
            // Some data missing, start from beginning
            startFreshConversation();
          }
        } else {
          // No saved data, start fresh
          startFreshConversation();
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        startFreshConversation();
      }
    };

    const startFreshConversation = () => {
      setStage('name');
      const greeting = {
        role: 'assistant',
        content: userName 
          ? `🕉️ Namaste ${userName}! I am Divine AI, your Vedic astrologer guide.\n\nBefore we dive into your cosmic journey, I need to fetch your birth chart. Let me gather some essential details from you.\n\n**What is your full name as per your birth certificate?**`
          : `🕉️ Namaste! I am Divine AI, your Vedic astrologer guide.\n\nBefore we dive into your cosmic journey, I need to fetch your birth chart. Let me gather some essential details from you.\n\n**What is your full name as per your birth certificate?**`,
        timestamp: new Date()
      };
      setMessages([greeting]);
    };

    if (userId) {
      loadUserProfile();
    } else {
      startFreshConversation();
    }
  }, [userId, userName]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Save user's astrology profile
  const saveUserProfile = async (data) => {
    try {
      // Check if profile exists
      const existing = await base44.entities.Kundli.filter({ 
        user_id: userId, 
        is_deleted: false 
      }, '-created_date', 1);

      if (existing && existing.length > 0) {
        await base44.entities.Kundli.update(existing[0].id, {
          name: data.name,
          birth_date: data.birth_date,
          birth_time: data.birth_time,
          birth_place: data.birth_place,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone_str: data.timezone
        });
      } else {
        await base44.entities.Kundli.create({
          user_id: userId,
          name: data.name,
          birth_date: data.birth_date,
          birth_time: data.birth_time,
          birth_place: data.birth_place,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone_str: data.timezone
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const fetchPlaceSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setPlaceSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await base44.functions.invoke('searchPlaces', { query });
      
      if (response.data.success && response.data.places) {
        setPlaceSuggestions(response.data.places);
        setShowSuggestions(true);
      } else {
        setPlaceSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setPlaceSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((query) => fetchPlaceSuggestions(query), 300),
    []
  );

  const fetchLocationData = async (place) => {
    try {
      const response = await base44.functions.invoke('getPlaceCoordinates', { place });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Location not found');
      }

      return {
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.timezone,
        formatted_address: response.data.formatted_address
      };
    } catch (error) {
      throw error;
    }
  };

  const handleSelectPlace = async (suggestion) => {
    const placeName = suggestion.formatted_address || suggestion.description;
    setInput(placeName);
    setShowSuggestions(false);
    setPlaceSuggestions([]);
    
    const userMessage = {
      role: 'user',
      content: placeName,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      toast.info('Fetching location coordinates...');
      
      if (suggestion.latitude && suggestion.longitude && suggestion.timezone) {
        const updatedUserData = {
          ...userData,
          birth_place: placeName,
          latitude: suggestion.latitude,
          longitude: suggestion.longitude,
          timezone: suggestion.timezone
        };
        setUserData(updatedUserData);
        
        // Save profile
        await saveUserProfile(updatedUserData);
        
        const assistantResponse = `Excellent! Birthplace: **${placeName}**\n\n✨ **Your cosmic profile has been saved!**\n\n📋 **Summary:**\n- Name: ${updatedUserData.name}\n- Birth Date: ${formatDate(updatedUserData.birth_date)}\n- Birth Time: ${updatedUserData.birth_time}\n- Birth Place: ${updatedUserData.birth_place}\n\n🔮 **Your birth chart is ready!** Ask me anything about your:\n- Life purpose & personality\n- Career & finances\n- Love & relationships\n- Health & well-being\n- Current planetary periods (Dasha)\n- Remedies & guidance\n\nWhat would you like to know?`;
        
        setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse, timestamp: new Date() }]);
        setStage('ready');
      } else {
        const locationData = await fetchLocationData(placeName);
        const updatedUserData = {
          ...userData,
          birth_place: locationData.formatted_address || placeName,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timezone: locationData.timezone
        };
        setUserData(updatedUserData);
        
        // Save profile
        await saveUserProfile(updatedUserData);
        
        const assistantResponse = `Excellent! Birthplace: **${updatedUserData.birth_place}**\n\n✨ **Your cosmic profile has been saved!**\n\n📋 **Summary:**\n- Name: ${updatedUserData.name}\n- Birth Date: ${formatDate(updatedUserData.birth_date)}\n- Birth Time: ${updatedUserData.birth_time}\n- Birth Place: ${updatedUserData.birth_place}\n\n🔮 **Your birth chart is ready!** Ask me anything about your:\n- Life purpose & personality\n- Career & finances\n- Love & relationships\n- Health & well-being\n- Current planetary periods (Dasha)\n- Remedies & guidance\n\nWhat would you like to know?`;
        
        setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse, timestamp: new Date() }]);
        setStage('ready');
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I couldn't verify that location. Please try selecting from the suggestions or type another city name.`, 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
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
        toast.info('Fetching location coordinates...');
        try {
          const locationData = await fetchLocationData(input.trim());
          const finalPlace = locationData.formatted_address || input.trim();
          const updatedUserData = {
            ...userData,
            birth_place: finalPlace,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timezone: locationData.timezone
          };
          setUserData(updatedUserData);
          
          // Save profile
          await saveUserProfile(updatedUserData);
          
          assistantResponse = `Excellent! Birthplace: **${finalPlace}**\n\n✨ **Your cosmic profile has been saved!**\n\n📋 **Summary:**\n- Name: ${updatedUserData.name}\n- Birth Date: ${formatDate(updatedUserData.birth_date)}\n- Birth Time: ${updatedUserData.birth_time}\n- Birth Place: ${updatedUserData.birth_place}\n\n🔮 **Your birth chart is ready!** Ask me anything about your:\n- Life purpose & personality\n- Career & finances\n- Love & relationships\n- Health & well-being\n- Current planetary periods (Dasha)\n- Remedies & guidance\n\nWhat would you like to know?`;
          setStage('ready');
          setShowSuggestions(false);
          setPlaceSuggestions([]);
        } catch (error) {
          assistantResponse = `I couldn't find that location. Please type the city name more clearly (e.g., "Deoria, Uttar Pradesh, India").\n\nTry again:`;
          setLoading(false);
          setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse, timestamp: new Date() }]);
          return;
        }
      } 
      else if (stage === 'ready') {
        // Add to conversation history for context
        const newHistory = [...conversationHistory, { role: 'user', content: input }];
        setConversationHistory(newHistory);

        // Call the AI astrologer with full context including conversation history
        const response = await base44.functions.invoke('vedicAstrologerChat', {
          user_data: userData,
          user_question: input,
          conversation_history: newHistory.slice(-10) // Last 10 messages for context
        });

        if (response.data.success) {
          assistantResponse = response.data.answer;
          // Add assistant response to history
          setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
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

  if (stage === 'loading') {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-white rounded-xl items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
        <p className="text-purple-600">Loading your cosmic profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-white rounded-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Vedic Astrologer AI</h3>
          <p className="text-xs text-white/80">Ask me about your Kundali</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs">Online</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
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
        {stage !== 'ready' && stage !== 'loading' && (
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
            <div className={`flex items-center gap-1 ${stage === 'name' ? 'text-purple-600 font-medium' : (userData.name ? 'text-green-600' : '')}`}>
              {userData.name ? <Check className="w-3 h-3" /> : <User className="w-3 h-3" />}
              Name
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1 ${stage === 'dob' ? 'text-purple-600 font-medium' : (userData.birth_date ? 'text-green-600' : '')}`}>
              {userData.birth_date ? <Check className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              DOB
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1 ${stage === 'time' ? 'text-purple-600 font-medium' : (userData.birth_time ? 'text-green-600' : '')}`}>
              {userData.birth_time ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              Time
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1 ${stage === 'place' ? 'text-purple-600 font-medium' : (userData.birth_place ? 'text-green-600' : '')}`}>
              {userData.birth_place ? <Check className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
              Place
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1 ${stage === 'ready' ? 'text-green-600 font-medium' : ''}`}>
              <Sparkles className="w-3 h-3" />
              Ready
            </div>
          </div>
        )}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (stage === 'place') {
                    debouncedFetchSuggestions(e.target.value);
                  }
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  if (stage === 'place' && placeSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder={
                  stage === 'name' ? 'Enter your full name...' :
                  stage === 'dob' ? 'Enter date (DD-MM-YYYY)...' :
                  stage === 'time' ? 'Enter time (HH:MM)...' :
                  stage === 'place' ? 'Start typing your city name...' :
                  'Ask me anything about your chart...'
                }
                disabled={loading}
                className="flex-1 h-12 rounded-xl"
              />
              
              {/* Place Suggestions Dropdown */}
              {stage === 'place' && showSuggestions && (placeSuggestions.length > 0 || loadingSuggestions) && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-purple-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {loadingSuggestions ? (
                    <div className="p-3 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching places...
                    </div>
                  ) : (
                    placeSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPlace(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{suggestion.description}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 h-12 px-6 rounded-xl"
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
    </div>
  );
}