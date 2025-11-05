import React, { useState, useEffect } from 'react';
import useAppStore from '../../../store/useAppStore';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { 
  CalendarIcon,
  DownloadIcon,
  TrendingUpIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  ChartBarIcon 
} from 'lucide-react';

const SalesReportView = ({ className }) => {
  const { salesReport, fetchSalesReport, currentUser: user } = useAppStore();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [storeFilter, setStoreFilter] = useState('all');
  const [reportType, setReportType] = useState('daily');

  useEffect(() => {
    // Fetch initial report data
    loadReportData();
  }, [dateRange, storeFilter, reportType]);

  const loadReportData = async () => {
    try {
      await fetchSalesReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        storeId: storeFilter === 'all' ? undefined : storeFilter,
        reportType
      });
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    loadReportData();
  };

  const handleDownload = () => {
    // Implement download functionality
    alert('Download functionality would be implemented here');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reporte de Ventas</h2>
          <p className="text-gray-500">
            Análisis detallado de las ventas por período
          </p>
        </div>
        <Button onClick={handleDownload}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Descargar Reporte
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filtros de Reporte</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="pl-8 w-full"
                />
                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha Fin</label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="pl-8 w-full"
                />
                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="storeFilter" className="block text-sm font-medium text-gray-700">Sucursal</label>
              <select
                id="storeFilter"
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Todas las sucursales</option>
                {user?.assigned_stores?.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">Agrupamiento</label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Ventas Totales</h3>
              <TrendingUpIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              ${salesReport?.totalSales?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-gray-500">
              {salesReport?.dateRange ? `Del ${salesReport.dateRange.startDate} al ${salesReport.dateRange.endDate}` : 'No hay datos'}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Transacciones</h3>
              <ShoppingCartIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{salesReport?.totalTransactions || 0}</div>
            <p className="text-xs text-gray-500">Ventas totales</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Ticket Promedio</h3>
              <DollarSignIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              ${salesReport?.avgTicket?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-gray-500">Promedio por venta</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Margen de Ganancia</h3>
              <ChartBarIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              {salesReport?.profitMargin ? `${salesReport.profitMargin.toFixed(2)}%` : '0.00%'}
            </div>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detalles de Ventas</h3>
          {salesReport?.sales ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transacciones</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesReport.sales.map((sale, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.store}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.transactions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.salesAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.costAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.profitAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.profitMargin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUpIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold">No hay datos</h3>
              <p className="text-gray-500 mb-4">
                No se encontraron datos de ventas para el rango de fechas seleccionado
              </p>
              <Button onClick={handleRefresh}>Actualizar datos</Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* Additional charts would go here */}
    </div>
  );
};

export default SalesReportView;