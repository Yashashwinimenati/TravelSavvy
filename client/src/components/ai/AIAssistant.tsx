import { useState, useEffect, useRef } from 'react';
import { useAI } from '@/hooks/use-ai';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

const AIAssistant = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isProcessing, processQuery } = useAI();
  const { isListening, startListening, stopListening, transcript } = useVoiceRecognition();
  
  // Initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your TravelSage assistant. I can help you plan your perfect trip. What kind of experience are you looking for?"
      }
    ]);
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for open assistant event
  useEffect(() => {
    const handleOpenAssistant = () => {
      setIsExpanded(true);
    };
    
    document.addEventListener('openAIAssistant', handleOpenAssistant);
    return () => {
      document.removeEventListener('openAIAssistant', handleOpenAssistant);
    };
  }, []);

  // Toggle assistant visibility
  const toggleAssistant = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() && !transcript) return;

    const userMessage = input.trim() || transcript;
    setInput('');
    
    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Process with AI
      const response = await processQuery(userMessage);
      
      // Add AI response to chat
      const newAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, newAIMessage]);
    } catch (error) {
      // Handle error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process your request at the moment. Please try again later."
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    if (isListening) {
      stopListening();
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setInput(transcript);
      }
    } else {
      startListening();
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick suggestions
  const suggestions = [
    "Suggest restaurants in Barcelona",
    "Plan a 3-day trip to Tokyo",
    "What are must-see attractions in Paris?"
  ];

  return (
    <div 
      className={`ai-assistant fixed bottom-0 right-0 z-40 w-full md:w-96 bg-white shadow-lg rounded-t-xl overflow-hidden transition-all ${isExpanded ? 'h-[400px]' : 'h-[60px]'}`}
    >
      <div 
        className="bg-primary px-4 py-3 text-white flex justify-between items-center cursor-pointer" 
        onClick={toggleAssistant}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <i className="fas fa-robot text-white"></i>
          </div>
          <span className="font-medium">TravelSage Assistant</span>
        </div>
        <i className={`fas fa-chevron-${isExpanded ? 'down' : 'up'}`}></i>
      </div>
      
      {isExpanded && (
        <div className="flex flex-col h-[calc(100%-60px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'items-start'} space-x-3 ${message.role === 'user' ? 'space-x-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 ${message.role === 'assistant' ? 'bg-primary/20' : 'bg-orange-500/20'} rounded-full flex-shrink-0 flex items-center justify-center`}>
                    <i className={`fas ${message.role === 'assistant' ? 'fa-robot text-primary' : 'fa-user text-orange-500'}`}></i>
                  </div>
                  <div className={`${message.role === 'assistant' ? 'bg-gray-100' : 'bg-orange-500/10'} rounded-lg p-3 max-w-[80%]`}>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder={isListening ? 'Listening...' : 'Ask me anything about your trip...'}
                value={isListening ? transcript || 'Listening...' : input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isListening || isProcessing}
                className={isListening ? 'bg-red-50' : ''}
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={(!input.trim() && !transcript) || isProcessing}
              >
                {isProcessing ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </Button>
              <Button 
                size="icon" 
                variant={isListening ? "destructive" : "secondary"}
                onClick={handleVoiceInput}
              >
                <i className="fas fa-microphone"></i>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition-colors"
                  onClick={() => {
                    setInput(suggestion);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
