"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import './ChatPopup.css';

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  includeContactButton?: boolean;
}

interface ServiceOption {
  id: string;
  name: string;
  description: string;
}

export default function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  // Service options for Preeminent Professional Services
  const serviceOptions: ServiceOption[] = [
    {
      id: "technical",
      name: "Professional/Technical Services",
      description: "Property management, real estate development, and industrial/commercial properties services."
    },
    {
      id: "environmental",
      name: "Commercial Cleaning/Environmental Services",
      description: "Comprehensive cleaning solutions for commercial properties."
    },
    {
      id: "staffing",
      name: "Professional Events and Staffing",
      description: "Temporary staffing for commercial and private/public events."
    },
    {
      id: "ev",
      name: "EV Services",
      description: "Turn-key services for commercial fleet and vehicle electrification."
    }
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm the Preeminent Professional Services assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Webhook URL for tracking conversations (you should replace this with your actual webhook URL)
  const webhookUrl = "YOUR_WEBHOOK_URL";

  // Function to send data to webhook
  const sendToWebhook = async (userMessage: string, assistantMessage: string) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          assistantMessage,
          timestamp: new Date().toISOString(),
          source: 'Preeminent Professional Services Chat'
        }),
      });
      
      if (!response.ok) {
        console.error('Webhook error:', response.status);
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add initial messages
  useEffect(() => {
    const timer = setTimeout(() => {
      const initialMessage = "I can help you learn about our services, including Professional/Technical Services, Commercial Cleaning, Events and Staffing, and EV Services. What would you like to know more about?";
      
      setMessages(prev => [...prev, 
        {
          role: "assistant",
          content: initialMessage,
          timestamp: new Date()
        }
      ]);
      
      // Send initial conversation to webhook
      sendToWebhook("", initialMessage);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Format message text with proper styling
  const formatMessageText = (text: string) => {
    return text
      .replace(/• ([^:]+):/g, '• <strong>$1</strong>:')
      .replace(/- ([^:]+):/g, '• <strong>$1</strong>:')
      .replace(/(Professional\/Technical Services|Commercial Cleaning|Environmental Services|Events and Staffing|EV Services):/g, '<strong>$1</strong>:');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessageText = message.trim();
    const userMessage: Message = {
      role: "user",
      content: userMessageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Prepare conversation history for the API
      const conversationHistory = messages
        .filter(msg => msg.role !== "system") // Exclude system messages
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Add the new user message
      conversationHistory.push({
        role: "user",
        content: userMessageText
      });

      const response = await fetch('/api/chatBot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        includeContactButton: data.suggestsConsultation
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Send to webhook
      sendToWebhook(userMessageText, data.message);
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again later or contact us directly.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      // Send error to webhook
      sendToWebhook(userMessageText, "I apologize, but I'm having trouble connecting right now. Please try again later or contact us directly.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactButtonClick = () => {
    // Track contact button clicks in webhook
    sendToWebhook("User clicked contact button", "Opening contact popup");
    setIsOpen(false); // Close chat window
    setShowContactForm(true); // Show contact form
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 hover:from-[#1E293B] hover:to-[#0F172A] backdrop-blur-xl p-3.5 rounded-full transition-all duration-300 shadow-lg border border-[#94A3B8]/20"
          style={{
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(148, 163, 184, 0.1), 0 0 20px 0px rgba(100, 116, 139, 0.1)"
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E2E8F0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse absolute top-3 right-3"></span>
          <svg 
            className="w-6 h-6 text-[#E2E8F0] drop-shadow-sm" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "550px"
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="chat-container"
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-content">
                <div className="flex items-center gap-3.5">
                  <div className="chat-avatar">
                    <svg className="w-5 h-5 text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="chat-title">Financial Advisor</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                      <p className="chat-subtitle">Investment Expert</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-[#1E293B]/50 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isMinimized ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 12H6" />
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-[#1E293B]/50 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="messages-container hide-scrollbar">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message-group ${
                        index > 0 && messages[index - 1].role !== msg.role ? "mt-10" : ""
                      }`}
                    >
                      {(index === 0 || messages[index - 1].role !== msg.role) && (
                        <span className="message-role-label">
                          {msg.role === "user" ? "You" : "Financial Advisor"}
                        </span>
                      )}
                      
                      <div className={`message-bubble ${msg.role}`}>
                        <div 
                          className="message-text"
                          dangerouslySetInnerHTML={{ __html: formatMessageText(msg.content) }}
                        />
                        <p className="message-timestamp">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      
                      {msg.includeContactButton && msg.role === "assistant" && (
                        <button
                          onClick={handleContactButtonClick}
                          className="consultation-button"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Schedule Consultation
                        </button>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mt-8">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-px" />
                </div>

                {/* Input */}
                <div className="chat-input-container">
                  <div className="chat-input-wrapper">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask about our services..."
                      className="chat-input"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading}
                      className="send-button"
                      aria-label="Send message"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 