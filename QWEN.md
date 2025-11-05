# RECOOM POS - Sistema de Punto de Venta para Abarrotes Multi-Sucursal

## 📋 Project Overview

RECOOM POS is a specialized Point of Sale (POS) application designed for grocery stores (abarrotes) with a distributed inventory model. The system supports multiple locations: Central Warehouse, Store 1, and Store 2. It's built as a Progressive Web App (PWA) to function in environments with variable connectivity, allowing complete offline operation.

### Key Technologies
- **Frontend**: React (SPA) with Vite
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL) with local IndexedDB storage
- **Offline Storage**: IndexedDB for offline functionality
- **Deployment**: PWA (Progressive Web App)

### Core Features
- **PWA Capabilities**: Installable, offline operation, automatic synchronization
- **POS Interface**: Quick sales interface with product search and barcode scanning
- **Distributed Inventory**: Stock control by location with alerts for low stock
- **Inter-store Transfers**: Request, approval, and tracking of transfers
- **Role-based Access**: Different permissions for Cashier, Manager, and Administrator
- **Reporting**: Sales reports, profit analysis, and inventory movements
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## 🔧 Building and Running

### Prerequisites
- Node.js 16+
- npm 7+

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Build PWA: `npm run build-pwa`
- Lint code: `npm run lint`

### Environment Configuration
Create a `.env.local` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Database Schema
The application uses Supabase with PostgreSQL and includes these main tables:
- `products` - Product information and pricing
- `categories` - Product categories and subcategories
- `users` - User accounts with roles and store assignments
- `stores` - Store locations
- `inventory_batches` - Inventory by location with expiration tracking
- `sales` - Transaction records with payment details
- `clients` - Customer information
- `transfers` - Inter-store transfer requests
- `shopping_list` - Purchase requests
- `expenses` - Expense tracking
- `cash_closings` - Cash register closing records

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
├── features/           # Feature-specific modules
│   ├── pos/           # Point of sale functionality
│   ├── inventory/      # Inventory management
│   ├── transfers/     # Inter-store transfers
│   └── reports/      # Reports and analytics
├── pages/             # Main application pages
├── store/             # Global state management (Zustand)
├── utils/             # Utility and helper functions
├── config/            # Service configuration (Supabase, etc.)
└── hooks/             # Custom React hooks
```

## 📱 Offline Functionality

### Local Data Storage
- Product catalog
- Categories and subcategories
- User information and assigned stores
- Inventory batches
- Recent sales (last 100)
- Clients and suppliers

### Offline Operations
- Product search and selection
- Sale processing
- Cart management
- Discount application
- Sale note recording

### Automatic Synchronization
- Syncs pending transactions when connection is restored
- Updates local data with server information
- Ensures data consistency

## 🎨 Development Conventions

### Styling
- Uses Tailwind CSS with a custom dark-themed design system
- Responsive design with breakpoints for xs, sm, md, lg, xl, 2xl
- Consistent color palette with primary, surface, and accent colors
- Dark mode support using 'class' strategy

### Code Quality
- ESLint for code linting with React plugin
- Prettier-style formatting (implied from configuration)
- Modern JavaScript/ES6+ syntax
- React hooks for state and side effects
- Zustand for global state management

### PWA Implementation
- Service worker for offline functionality
- Web app manifest for installability
- Network status detection
- Automatic synchronization when online

## 🚀 Deployment

### PWA Deployment
Use the `npm run build-pwa` command to create a production build with all necessary PWA assets (manifest, service worker, icons).

### Supabase Backend
The application is configured to work with Supabase as the primary backend, with automatic migration scripts provided for setting up the required database schema.

## 🛡️ Security
- User authentication with role-based permissions
- Route protection based on user permissions
- Input validation on the client and server side
- Secure credential management through environment variables