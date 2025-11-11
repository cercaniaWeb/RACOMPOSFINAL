// src/components/IntelligentChat.jsx
// Intelligent chat component that allows users to query POS data in natural language

import { useState, useRef, useEffect } from 'react';

const IntelligentChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to send a message to our API
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send the message to our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add AI response to chat
        const aiMessage = { 
          id: Date.now() + 1, 
          text: data.message, 
          sender: 'ai',
          data: data.data // Include the raw data if needed for additional UI
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Add error message to chat
        const errorMessage = { 
          id: Date.now() + 1, 
          text: 'Lo siento, hubo un error procesando tu solicitud.', 
          sender: 'ai' 
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        id: Date.now() + 1, 
        text: 'Lo siento, hubo un error de conexión.', 
        sender: 'ai' 
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
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white">
        <h2 className="text-xl font-bold">Asistente de Negocios Inteligente</h2>
        <p className="text-sm opacity-80">Haz preguntas sobre tus ventas, inventario y más</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: '400px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="mb-4 text-center">
              <div className="bg-gray-200 dark:bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
            </div>
            <p className="text-center">¿Cómo puedo ayudarte hoy?</p>
            <p className="text-sm mt-2 text-center max-w-md">
              Puedes preguntarme cosas como:<br />
              <em>"¿Cuáles fueron las ventas de lácteos esta semana?"</em><br />
              <em>"¿Qué inventario hay de abarrotes?"</em>
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-indigo-500 text-white rounded-tr-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-3 rounded-tl-none max-w-[80%]">
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
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta sobre el negocio..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg p-2 resize-none h-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            rows="1"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white px-4 rounded-r-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            Enviar
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Ejemplos: "¿Cuánto se vendió de lácteos esta semana?", "¿Qué productos tienen bajo inventario?"
        </p>
      </div>
    </div>
  );
};

export default IntelligentChat;