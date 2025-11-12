import React, { useState, useRef, useEffect } from 'react';
import useNotificationStore from '../features/notifications/store/useNotificationStore';
import { 
  ShoppingCart, 
  BarChart3, 
  Wallet, 
  Truck, 
  Users, 
  Bell, 
  Search, 
  Plus, 
  CreditCard, 
  Package, 
  User, 
  LogOut,
  Menu,
  X,
  Settings,
  Store,
  Shield,
  Edit,
  Trash2
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  
  const { notifications, clearAllNotifications } = useNotificationStore();
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target) &&
          !event.target.closest('[data-testid="notification-button"]')) {
        setShowNotifications(false);
      }
      
      if (userMenuRef.current && !userMenuRef.current.contains(event.target) &&
          !event.target.closest('[data-testid="user-menu-button"]')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const location = useLocation();
  const { currentUser, logout } = useAppStore();
  
  // Determine active module based on current path
  const getActiveModule = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'admin' && pathParts[1]) {
      return pathParts[1];
    }
    return pathParts[0] || 'pos';
  };
  
  const activeModule = getActiveModule();

  const modules = [
    { id: 'pos', name: 'Punto de Venta', icon: ShoppingCart, path: '/pos/1' },  // Assuming store ID 1 for demo
    { id: 'products', name: 'Productos', icon: Package, path: '/products' },
    { id: 'inventory', name: 'Inventario', icon: Package, path: '/inventory' },
    { id: 'reports', name: 'Reportes', icon: BarChart3, path: '/reports' },
    { id: 'expenses', name: 'Gastos', icon: Wallet, path: '/expenses' },
    { id: 'transfers', name: 'Traslados', icon: Truck, path: '/transfers' },
    { id: 'clients', name: 'Clientes', icon: Users, path: '/clients' },
    { id: 'users', name: 'Usuarios', icon: User, path: '/users' },
    { id: 'settings', name: 'Configuración', icon: Settings, path: '/settings' }
  ];

  const NavigationBar = () => (
    <header className="bg-[#282837] border-b border-[#3a3a4a] sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <img 
              src="/src/utils/logopos.png" 
              alt="Logo RACOM POS" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-[#F0F0F0]">RACOM POS</span>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.id}
                  to={module.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeModule === module.id
                      ? 'text-[#8A2BE2] bg-[#3a3a4a]'
                      : 'text-[#a0a0b0] hover:text-[#F0F0F0] hover:bg-[#3a3a4a]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{module.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-[#1D1D27] rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-[#a0a0b0] mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent text-[#F0F0F0] placeholder-[#a0a0b0] outline-none w-32"
            />
          </div>
          
          <div className="relative">
            <button 
              className="relative p-2 text-[#a0a0b0] hover:text-[#F0F0F0] hover:bg-[#3a3a4a] rounded-lg transition-colors"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false); // Close user menu when notifications are opened
              }}
              data-testid="notification-button"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#8A2BE2] rounded-full"></span>
            </button>
            
            {showNotifications && (
              <div ref={notificationsRef} className="absolute right-0 mt-2 w-80 bg-[#282837] rounded-xl border border-[#3a3a4a] shadow-xl z-50">
                <div className="p-4 border-b border-[#3a3a4a]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[#F0F0F0] font-bold">Notificaciones</h3>
                    <button 
                      className="text-[#a0a0b0] hover:text-[#8A2BE2] text-sm"
                      onClick={clearAllNotifications}
                    >
                      Limpiar todas
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-4 border-b border-[#3a3a4a] hover:bg-[#1D1D27] transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          {notification.type === 'success' ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          ) : notification.type === 'error' ? (
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          ) : notification.type === 'warning' ? (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          ) : (
                            <div className="w-2 h-2 bg-[#8A2BE2] rounded-full mt-2"></div>
                          )}
                          <div className="flex-1">
                            <p className="text-[#F0F0F0] text-sm">{notification.message}</p>
                            <p className="text-[#a0a0b0] text-xs mt-1">Hace un momento</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[#a0a0b0]">
                      <p>No hay notificaciones</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-3"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false); // Close notifications when user menu is opened
              }}
              data-testid="user-menu-button"
            >
              <div className="w-8 h-8 bg-[#8A2BE2] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-[#F0F0F0] font-medium">
                {currentUser?.name || 'Usuario'}
              </span>
            </button>
            {showUserMenu && (
              <div ref={userMenuRef} className="absolute right-0 mt-2 w-48 bg-[#282837] rounded-xl border border-[#3a3a4a] shadow-xl z-50">
                <button
                  onClick={logout}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left text-[#a0a0b0] hover:text-[#F0F0F0] hover:bg-[#3a3a4a] rounded-lg"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
          
          <button className="md:hidden p-2 text-[#a0a0b0] hover:text-[#F0F0F0]">
            {sidebarOpen ? (
              <X className="w-5 h-5" onClick={() => setSidebarOpen(false)} />
            ) : (
              <Menu className="w-5 h-5" onClick={() => setSidebarOpen(true)} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden bg-[#282837] border-t border-[#3a3a4a]">
          <div className="px-4 py-2 space-y-1">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.id}
                  to={module.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 w-full px-3 py-3 rounded-lg transition-all duration-200 ${
                    activeModule === module.id
                      ? 'text-[#8A2BE2] bg-[#3a3a4a]'
                      : 'text-[#a0a0b0] hover:text-[#F0F0F0] hover:bg-[#3a3a4a]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{module.name}</span>
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="flex items-center space-x-3 w-full px-3 py-3 rounded-lg transition-all duration-200 text-[#a0a0b0] hover:text-[#F0F0F0] hover:bg-[#3a3a4a]"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );

  return (
    <div className="min-h-screen bg-[#1D1D27] text-[#F0F0F0]">
      <NavigationBar />
      <div className="flex">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;