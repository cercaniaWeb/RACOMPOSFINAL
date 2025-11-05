import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import TransfersPage from './pages/TransfersPage';
import PurchasesPage from './pages/PurchasesPage';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import ClientsPage from './pages/ClientsPage';
import ExpensesPage from './pages/ExpensesPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/pos/:storeId" element={
          <ProtectedRoute roles={['cajera', 'gerente', 'admin']}>
            <Layout activeModule="pos">
              <POSPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute roles={['gerente', 'admin']}>
            <Layout activeModule="reports">
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/transfers" element={
          <ProtectedRoute roles={['gerente', 'admin']}>
            <Layout activeModule="transfers">
              <TransfersPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/expenses" element={
          <ProtectedRoute roles={['gerente', 'admin']}>
            <Layout activeModule="expenses">
              <ExpensesPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute roles={['admin']}>
            <Layout activeModule="users">
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/clients" element={
          <ProtectedRoute roles={['gerente', 'admin']}>
            <Layout activeModule="clients">
              <ClientsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute roles={['admin', 'gerente']}>
            <Layout activeModule="settings">
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute roles={['gerente', 'admin']}>
            <Layout activeModule="inventory">
              <InventoryPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute roles={['gerente', 'admin']}>
            <Layout activeModule="products">
              <ProductsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin', 'gerente']}>
            <Layout>
              <AdminDashboardPage />
            </Layout>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="pos" />} />
          <Route path="pos" element={
            <ProtectedRoute roles={['admin', 'gerente']}>
              <Layout activeModule="pos">
                <POSPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="products" element={
            <ProtectedRoute roles={['admin', 'gerente']}>
              <Layout activeModule="products">
                <ProductsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="inventory" element={
            <ProtectedRoute roles={['admin', 'gerente']}>
              <Layout activeModule="inventory">
                <InventoryPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute roles={['admin', 'gerente']}>
              <Layout activeModule="reports">
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute roles={['admin', 'gerente']}>
              <Layout activeModule="users">
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="transfers" element={
            <ProtectedRoute roles={['admin', 'gerente']}>
              <Layout activeModule="transfers">
                <TransfersPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="expenses" element={
            <ProtectedRoute roles={['admin', 'gerente']}>
              <Layout activeModule="expenses">
                <ExpensesPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute roles={['admin', 'gerente']}>
              <Layout activeModule="settings">
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="clients" element={
            <ProtectedRoute roles={['admin', 'gerente']}>
              <Layout activeModule="clients">
                <ClientsPage />
              </Layout>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;