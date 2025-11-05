import React from 'react';
import { ShoppingCart, BarChart3, Wallet, Truck, Users, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
  // Mock data for dashboard
  const kpiData = [
    { title: 'Ventas Hoy', value: '$12,450', change: '+12.5%', icon: BarChart3, iconColor: 'text-green-500', bgColor: 'bg-green-500 bg-opacity-20' },
    { title: 'Pedidos', value: '142', change: '+8.2%', icon: ShoppingCart, iconColor: 'text-blue-500', bgColor: 'bg-blue-500 bg-opacity-20' },
    { title: 'Clientes', value: '1,248', change: '+3.1%', icon: Users, iconColor: 'text-purple-500', bgColor: 'bg-purple-500 bg-opacity-20' },
    { title: 'Inventario', value: '89%', change: '-2.3%', icon: Package, iconColor: 'text-orange-500', bgColor: 'bg-orange-500 bg-opacity-20' },
  ];

  const quickActions = [
    { name: 'Punto de Venta', icon: ShoppingCart, color: 'bg-[#8A2BE2]', link: '/pos/1' },
    { name: 'Productos', icon: Package, color: 'bg-orange-500', link: '/products' },
    { name: 'Inventario', icon: Package, color: 'bg-green-500', link: '/inventory' },
    { name: 'Reportes', icon: BarChart3, color: 'bg-blue-500', link: '/reports' },
    { name: 'Gastos', icon: Wallet, color: 'bg-yellow-500', link: '/expenses' },
    { name: 'Traslados', icon: Truck, color: 'bg-purple-500', link: '/transfers' },
    { name: 'Clientes', icon: Users, color: 'bg-pink-500', link: '/clients' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <h2 className="text-2xl font-bold text-[#F0F0F0]">Panel de Administración</h2>

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

      {/* Quick Actions */}
      <div className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a]">
        <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className="flex flex-col items-center justify-center p-4 bg-[#1D1D27] rounded-lg border border-[#3a3a4a] hover:bg-[#3a3a4a] transition-colors"
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[#F0F0F0] text-sm font-medium">{action.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a]">
          <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Ventas Recientes</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between py-2 border-b border-[#3a3a4a] last:border-none">
                <div>
                  <p className="text-[#F0F0F0] font-medium">Venta #{String(item).padStart(4, '0')}</p>
                  <p className="text-[#a0a0b0] text-sm">Cliente: Cliente {item}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#8A2BE2] font-bold">${(item * 125.75).toFixed(2)}</p>
                  <p className="text-[#a0a0b0] text-xs">Hace {item}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#282837] rounded-xl p-6 border border-[#3a3a4a]">
          <h3 className="text-lg font-bold text-[#F0F0F0] mb-4">Productos con Bajo Stock</h3>
          <div className="space-y-4">
            {[
              { name: 'Producto 1', stock: 5, min: 10 },
              { name: 'Producto 2', stock: 3, min: 8 },
              { name: 'Producto 3', stock: 7, min: 15 },
              { name: 'Producto 4', stock: 2, min: 5 }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-[#3a3a4a] last:border-none">
                <div>
                  <p className="text-[#F0F0F0] font-medium">{product.name}</p>
                  <p className="text-[#a0a0b0] text-sm">Mínimo: {product.min}</p>
                </div>
                <span className={`font-bold ${
                  product.stock <= product.min * 0.5 ? 'text-red-500' : 
                  product.stock <= product.min ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {product.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;