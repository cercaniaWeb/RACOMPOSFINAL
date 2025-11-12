// src/features/reports/ReportChatModal.jsx
// AI-powered report assistant that allows users to query POS data in natural language
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X } from 'lucide-react';

const ReportChatModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: '¡Hola! Soy tu asistente de inteligencia de negocios. ¿En qué puedo ayudarte hoy? Puedo generar informes de ventas, inventario, comparaciones de periodos, productos más vendidos, etc.', 
      sender: 'bot' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to send a message to our API
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send the message to our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add AI response to chat
        const aiMessage = {
          id: Date.now() + 1,
          text: data.message,
          sender: 'bot',
          data: data.data // Include the raw data if needed for additional UI
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Add error message to chat
        const errorMessage = {
          id: Date.now() + 1,
          text: 'Lo siento, hubo un error procesando tu solicitud.',
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Lo siento, hubo un error de conexión.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-h-[700px] bg-[#282837] rounded-xl border border-[#3a3a4a] overflow-hidden">
      <div className="p-4 bg-[#1D1D27] border-b border-[#3a3a4a] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-[#8A2BE2] p-2 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[#F0F0F0]">Asistente de Inteligencia de Negocios</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              // Function to export conversation as text
              const textContent = messages.map(m => `[${m.sender}]: ${m.text}`).join('\n\n');
              const blob = new Blob([textContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `chat_report_${new Date().toISOString().slice(0, 10)}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="text-[#a0a0b0] hover:text-[#F0F0F0] p-1 rounded"
            title="Exportar conversación como TXT"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button 
            onClick={() => {
              // Function to export as PDF would go here
              alert("Exportar a PDF pronto disponible");
            }}
            className="text-[#a0a0b0] hover:text-[#F0F0F0] p-1 rounded"
            title="Exportar como PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </button>
          <button 
            onClick={onClose} 
            className="text-[#a0a0b0] hover:text-[#F0F0F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-[#8A2BE2] text-white rounded-br-none'
                  : 'bg-[#3a3a4a] text-[#F0F0F0] rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#3a3a4a] text-[#F0F0F0] rounded-lg p-3 rounded-bl-none max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#3a3a4a]">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu pregunta sobre el negocio..."
            className="flex-1 bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-[#8A2BE2] text-white p-2 rounded-lg hover:bg-[#7a1bd2] disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[#a0a0b0] mt-2">
          Ejemplos: "¿Cuáles fueron las ventas de lácteos esta semana?", "¿Qué productos tienen bajo inventario?", "¿Cómo se comparan las ventas de esta semana con la anterior?"
        </p>
      </div>
    </div>
  );
};

export default ReportChatModal;