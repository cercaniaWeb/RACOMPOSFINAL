import React, { useState } from 'react';
import { BarChart3, ShoppingCart, Users, Package, TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import SalesReportView from '../features/reports/components/SalesReportView';
import ReportChatModal from '../features/reports/ReportChatModal';
import Modal from '../components/ui/Modal';

const ReportsPage = () => {
  // Mock data for reports
  const kpiData = [
    { title: 'Ventas Hoy', value: '$12,450', change: '+12.5%', icon: BarChart3, iconColor: 'text-green-500', bgColor: 'bg-green-500 bg-opacity-20' },
    { title: 'Pedidos', value: '142', change: '+8.2%', icon: ShoppingCart, iconColor: 'text-blue-500', bgColor: 'bg-blue-500 bg-opacity-20' },
    { title: 'Clientes', value: '1,248', change: '+3.1%', icon: Users, iconColor: 'text-purple-500', bgColor: 'bg-purple-500 bg-opacity-20' },
    { title: 'Inventario', value: '89%', change: '-2.3%', icon: Package, iconColor: 'text-orange-500', bgColor: 'bg-orange-500 bg-opacity-20' },
  ];

  const categoryData = [
    { name: 'Electrónicos', percentage: 80 },
    { name: 'Ropa', percentage: 65 },
    { name: 'Alimentos', percentage: 50 },
    { name: 'Hogar', percentage: 35 },
  ];

  const salesTrend = [40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 65, 95];

  const [showReportChatModal, setShowReportChatModal] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics'); // 'sales', 'analytics'

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Reportes y Análisis</h2>
        <button 
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          onClick={() => setShowReportChatModal(true)}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Asistente de Reportes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-[#3a3a4a]">
        <button
          className={`pb-2 px-1 ${activeTab === 'sales' ? 'text-[#8A2BE2] border-b-2 border-[#8A2BE2]' : 'text-[#a0a0b0]'}`}
          onClick={() => setActiveTab('sales')}
        >
          Reporte de Ventas
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === 'analytics' ? 'text-[#8A2BE2] border-b-2 border-[#8A2BE2]' : 'text-[#a0a0b0]'}`}
          onClick={() => setActiveTab('analytics')}
        >
          Análisis
        </button>
      </div>

      {/* Sales Report Section */}
      {activeTab === 'sales' && (
        <SalesReportView />
      )}

      {/* Analytics Section */}
      {activeTab === 'analytics' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#a0a0b0] font-medium">{item.title}</h3>
                    <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#F0F0F0]">{item.value}</p>
                  <p className={`text-sm flex items-center ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {item.change} vs ayer
                  </p>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Category */}
            <div className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a]">
              <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Ventas por Categoría</h3>
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-[#F0F0F0]">{category.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 h-2 bg-[#3a3a4a] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#8A2BE2] rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-[#8A2BE2] font-bold w-12 text-right">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Trend */}
            <div className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a]">
              <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Tendencia de Ventas</h3>
              <div className="h-64 flex items-end space-x-2 justify-center">
                {salesTrend.map((height, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-[#8A2BE2] to-purple-500 rounded-t w-6 transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Reports */}
          <div className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a]">
            <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Resumen de Ventas Recientes</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3a3a4a]">
                    <th className="py-3 px-4 text-left text-[#a0a0b0] text-sm font-semibold">Fecha</th>
                    <th className="py-3 px-4 text-left text-[#a0a0b0] text-sm font-semibold">Cliente</th>
                    <th className="py-3 px-4 text-left text-[#a0a0b0] text-sm font-semibold">Productos</th>
                    <th className="py-3 px-4 text-right text-[#a0a0b0] text-sm font-semibold">Total</th>
                    <th className="py-3 px-4 text-right text-[#a0a0b0] text-sm font-semibold">Método</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#3a3a4a]">
                    <td className="py-3 px-4 text-[#F0F0F0]">2024-01-15</td>
                    <td className="py-3 px-4 text-[#F0F0F0]">María González</td>
                    <td className="py-3 px-4 text-[#a0a0b0]">3 artículos</td>
                    <td className="py-3 px-4 text-right text-[#8A2BE2] font-bold">$245.50</td>
                    <td className="py-3 px-4 text-right text-[#F0F0F0]">Efectivo</td>
                  </tr>
                  <tr className="border-b border-[#3a3a4a]">
                    <td className="py-3 px-4 text-[#F0F0F0]">2024-01-14</td>
                    <td className="py-3 px-4 text-[#F0F0F0]">Juan Pérez</td>
                    <td className="py-3 px-4 text-[#a0a0b0]">5 artículos</td>
                    <td className="py-3 px-4 text-right text-[#8A2BE2] font-bold">$890.00</td>
                    <td className="py-3 px-4 text-right text-[#F0F0F0]">Tarjeta</td>
                  </tr>
                  <tr className="border-b border-[#3a3a4a]">
                    <td className="py-3 px-4 text-[#F0F0F0]">2024-01-13</td>
                    <td className="py-3 px-4 text-[#F0F0F0]">Ana Rodríguez</td>
                    <td className="py-3 px-4 text-[#a0a0b0]">2 artículos</td>
                    <td className="py-3 px-4 text-right text-[#8A2BE2] font-bold">$156.75</td>
                    <td className="py-3 px-4 text-right text-[#F0F0F0]">Efectivo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Report Chat Modal */}
      <Modal 
        isOpen={showReportChatModal}
        onClose={() => setShowReportChatModal(false)}
        title=""
        size="6xl"
      >
        <ReportChatModal 
          onClose={() => setShowReportChatModal(false)} 
        />
      </Modal>
    </div>
  );
};

export default ReportsPage;