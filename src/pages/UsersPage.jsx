import React, { useState, useEffect } from 'react';
import { Plus, User, Edit, Trash2 } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import UserFormModal from '../features/users/UserFormModal';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';

const UsersPage = () => {
  const { users, addUser, updateUser, deleteUser, stores, loadUsers, loadStores } = useAppStore();
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    loadUsers();
    loadStores(); // Load stores when the component mounts
  }, [loadUsers, loadStores]);

  return (
    <div className="flex-1 p-6 space-y-6 bg-[#1D1D27]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Gestión de Usuarios</h2>
        <button
          className="bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          onClick={() => {
            setCurrentUser(null);
            setShowUserModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1D1D27] border-b border-[#3a3a4a]">
              <tr>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Nombre</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Email</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Rol</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Tienda</th>
                <th className="text-left py-4 px-6 text-[#a0a0b0] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#3a3a4a] hover:bg-[#1D1D27] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#8A2BE2] rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[#F0F0F0] font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#a0a0b0]">{user.email}</td>
                  <td className="py-4 px-6 text-[#F0F0F0]">{user.role}</td>
                  <td className="py-4 px-6 text-[#F0F0F0]">
                    {stores.find(store => store.id === user.storeId)?.name || user.storeId}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setCurrentUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 text-[#a0a0b0] hover:text-[#8A2BE2] hover:bg-[#3a3a4a] rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-[#a0a0b0] hover:text-red-500 hover:bg-[#3a3a4a] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      <Modal
        isOpen={showUserModal}
        title={currentUser ? "Editar Usuario" : "Nuevo Usuario"}
        onClose={() => {
          setShowUserModal(false);
          setCurrentUser(null);
        }}
      >
        <UserFormModal
          user={currentUser}
          stores={stores}
          onClose={() => {
            setShowUserModal(false);
            setCurrentUser(null);
          }}
        />
      </Modal>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setShowDeleteConfirm(false);
            setUserToDelete(null);
          }
        }}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default UsersPage;