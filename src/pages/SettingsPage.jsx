import React, { useState } from 'react';
import { Store, Printer, Shield, ToggleRight, ToggleLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryManagementModal from '../features/products/CategoryManagementModal';
import Modal from '../components/ui/Modal';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [configSection, setConfigSection] = useState('store');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Mock printers
  const [printers, setPrinters] = useState([
    { id: 1, name: 'Impresora Principal', model: 'EPSON TM-T20', enabled: true },
    { id: 2, name: 'Impresora de Etiquetas', model: 'ZEBRA GK420D', enabled: false }
  ]);

  // Mock permissions
  const [permissions, setPermissions] = useState([
    { id: 1, name: 'Acceso a Reportes', enabled: true },
    { id: 2, name: 'Gestión de Inventario', enabled: true },
    { id: 3, name: 'Configuración del Sistema', enabled: false },
    { id: 4, name: 'Gestión de Usuarios', enabled: false }
  ]);

  const togglePrinter = (id) => {
    setPrinters(printers.map(printer => 
      printer.id === id ? { ...printer, enabled: !printer.enabled } : printer
    ));
  };

  const togglePermission = (id) => {
    setPermissions(permissions.map(permission => 
      permission.id === id ? { ...permission, enabled: !permission.enabled } : permission
    ));
  };

  return (
    <div className="flex-1 p-6 bg-[#1D1D27]">
      <h2 className="text-2xl font-bold text-[#F0F0F0] mb-6">Configuración</h2>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Config Navigation */}
        <div className="lg:w-64">
          <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-4">
            <nav className="space-y-2">
              {[
                { id: 'store', name: 'Configuración de Tienda', icon: Store },
                { id: 'printer', name: 'Impresoras', icon: Printer },
                { id: 'categories', name: 'Categorías', icon: Store },
                { id: 'permissions', name: 'Permisos', icon: Shield }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setConfigSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      configSection === item.id
                        ? 'text-[#8A2BE2] bg-[#3a3a4a]'
                        : 'text-[#a0a0b0] hover:text-[#F0F0F0] hover:bg-[#3a3a4a]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Config Content */}
        <div className="flex-1">
          <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-6">
            {configSection === 'store' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#F0F0F0]">Configuración de Tienda</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#a0a0b0] mb-2">Nombre de la Tienda</label>
                    <input 
                      type="text" 
                      defaultValue="RACOM POS Central"
                      className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-2">Dirección</label>
                    <input 
                      type="text" 
                      defaultValue="Av. Principal 123"
                      className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a0a0b0] mb-2">Teléfono</label>
                    <input 
                      type="text" 
                      defaultValue="+1 234 567 890"
                      className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg px-3 py-2 focus:border-[#8A2BE2] outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F0F0F0]">Modo Activo</span>
                    <button className="text-[#8A2BE2]">
                      <ToggleRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {configSection === 'printer' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#F0F0F0]">Configuración de Impresoras</h3>
                <div className="space-y-4">
                  {printers.map((printer) => (
                    <div key={printer.id} className="flex items-center justify-between p-4 bg-[#1D1D27] rounded-lg border border-[#3a3a4a]">
                      <div>
                        <h4 className="text-[#F0F0F0] font-medium">{printer.name}</h4>
                        <p className="text-[#a0a0b0] text-sm">{printer.model}</p>
                      </div>
                      <button 
                        onClick={() => togglePrinter(printer.id)}
                        className={printer.enabled ? "text-[#8A2BE2]" : "text-[#a0a0b0]"}
                      >
                        {printer.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {configSection === 'categories' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#F0F0F0]">Gestión de Categorías</h3>
                <div className="bg-[#1D1D27] rounded-lg p-4 border border-[#3a3a4a]">
                  <p className="text-[#a0a0b0] mb-4">
                    Aquí puedes gestionar las categorías y subcategorías de productos para organizar tu inventario.
                  </p>
                  <button 
                    className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    Gestión de Categorías
                  </button>
                </div>
              </div>
            )}

            {configSection === 'permissions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#F0F0F0]">Permisos de Usuarios</h3>
                <div className="space-y-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-4 bg-[#1D1D27] rounded-lg border border-[#3a3a4a]">
                      <span className="text-[#F0F0F0]">{permission.name}</span>
                      <button 
                        onClick={() => togglePermission(permission.id)}
                        className={permission.enabled ? "text-[#8A2BE2]" : "text-[#a0a0b0]"}
                      >
                        {permission.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#3a3a4a]">
              <button className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Management Modal */}
      <Modal 
        isOpen={showCategoryModal}
        title="Gestión de Categorías" 
        onClose={() => setShowCategoryModal(false)}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <CategoryManagementModal 
            onClose={() => setShowCategoryModal(false)} 
          />
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;