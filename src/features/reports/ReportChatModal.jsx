import React, { useState } from 'react';
import { Send, Bot, User, X } from 'lucide-react';

const ReportChatModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy tu asistente de reportes. ¿En qué puedo ayudarte hoy? Puedo generar informes de ventas, inventario, productos más vendidos, etc.', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      // Add user message
      const userMessage = { id: messages.length + 1, text: inputValue, sender: 'user' };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      // Simulate bot response (in a real implementation, this would call an AI API)
      setTimeout(() => {
        let botResponse = '';
        
        const lowerInput = inputValue.toLowerCase();
        
        if (lowerInput.includes('ventas') || lowerInput.includes('venta')) {
          botResponse = 'Generando informe de ventas... Puedo mostrarte el resumen de ventas del día, semana o mes, productos más vendidos, etc.';
        } else if (lowerInput.includes('inventario') || lowerInput.includes('producto')) {
          botResponse = 'Generando informe de inventario... Puedo mostrarte productos con bajo stock, productos más vendidos, niveles de inventario actuales, etc.';
        } else if (lowerInput.includes('cliente') || lowerInput.includes('clientes')) {
          botResponse = 'Generando informe de clientes... Puedo mostrarte los clientes más frecuentes, compras recientes, clientes con cuentas pendientes, etc.';
        } else {
          botResponse = 'Puedo ayudarte a generar reportes sobre ventas, inventario, clientes, proveedores y más. Por ejemplo, puedes preguntarme por "ventas de hoy", "productos con bajo stock" o "mejores clientes".';
        }
        
        const botMessage = { 
          id: newMessages.length + 1, 
          text: botResponse, 
          sender: 'bot' 
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }, 1000);
      
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#282837] rounded-xl border border-[#3a3a4a] overflow-hidden">
      <div className="p-4 bg-[#1D1D27] border-b border-[#3a3a4a] flex items-center space-x-3">
        <div className="bg-[#8A2BE2] p-2 rounded-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-[#F0F0F0]">Asistente de Reportes</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-[#8A2BE2] text-white rounded-br-none' 
                  : 'bg-[#3a3a4a] text-[#F0F0F0] rounded-bl-none'
              }`}
            >
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-[#3a3a4a]">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu solicitud de reporte..."
            className="flex-1 bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none"
          />
          <button
            onClick={handleSend}
            className="bg-[#8A2BE2] text-white p-2 rounded-lg hover:bg-[#7a1bd2] flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[#a0a0b0] mt-2">
          Ejemplos: "Ver ventas de hoy", "Productos con bajo stock", "Mejores clientes del mes"
        </p>
      </div>
    </div>
  );
};

export default ReportChatModal;