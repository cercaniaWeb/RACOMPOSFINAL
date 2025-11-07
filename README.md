# RECOOM POS - Sistema de Punto de Venta para Abarrotes Multi-Sucursal

## ⭐️ Descripción del Proyecto

RECOOM POS es una aplicación especializada en la gestión de abarrotes con un modelo de inventario distribuido: **Bodega Central**, **Tienda 1** y **Tienda 2**. Diseñada para operar en entornos con conectividad variable, incluye capacidades PWA (Progressive Web App) para funcionar completamente sin conexión.

## 🚀 Características Principales

### 📱 Progressive Web App (PWA)
- **Instalable** en dispositivos móviles y de escritorio
- **Funciona sin conexión** con almacenamiento local
- **Detección automática** de estado de red
- **Sincronización automática** cuando hay conexión

### 🛒 Punto de Venta
- Interfaz de venta rápida con búsqueda de productos
- Escaneo de códigos de barras mediante cámara móvil
- Gestión de carrito con descuentos y notas
- Procesamiento de pagos (efectivo, tarjeta)

### 📦 Inventario Distribuido
- Control de stock por ubicación (Bodega, Tiendas)
- Gestión de productos con categorías y subcategorías
- Alertas de stock bajo y próximas caducidades
- Historial de movimientos de inventario

### 🔄 Traslados entre Sucursales
- Solicitudes de traslado entre bodega y tiendas
- Aprobación y seguimiento de órdenes
- Confirmación de envío y recepción

### 👥 Gestión de Personal y Roles
- **Cajera**: Acceso al POS de su tienda asignada
- **Gerente**: Gestión de inventario, traslados y reportes
- **Administrador**: Configuración completa del sistema

### 📊 Reportes y Análisis
- Reportes de ventas por tienda
- Análisis de utilidad y movimientos de inventario
- Estado de caja y cierres

## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología |
|------------|------------|
| **Frontend** | React (SPA) con Vite |
| **Estilo** | Tailwind CSS |
| **Estado Global** | Zustand |
| **Base de Datos** | Firebase/Firestore (con almacenamiento local) |
| **Almacenamiento Offline** | IndexedDB |
| **Despliegue** | PWA (Progressive Web App) |

## 📱 Funcionalidades Móviles

### Escaneo de Códigos de Barras
- Uso de cámara trasera para dispositivos móviles
- Detección automática de códigos de productos
- Funciona en modo sin conexión

### Modo Sin Conexión
- Procesamiento completo de ventas sin Internet
- Almacenamiento local de transacciones
- Sincronización automática al recuperar conexión

### Instalación como App Nativa
- Icono independiente en la pantalla de inicio
- Experiencia nativa sin navegador
- Acceso directo a funciones del dispositivo

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 16+
- npm 7+

### Instalación
```bash
# Clonar el repositorio
git clone <repositorio-url>

# Entrar al directorio del proyecto
cd POStheme

# Instalar dependencias
npm install
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

### Construcción PWA
```bash
# Construir aplicación PWA
npm run build-pwa
```

## 📁 Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables de UI
├── features/           # Módulos específicos de funcionalidad
│   ├── pos/           # Punto de venta
│   ├── inventory/      # Gestión de inventario
│   ├── transfers/     # Traslados entre sucursales
│   └── reports/      # Reportes y análisis
├── pages/             # Páginas principales de la aplicación
├── store/             # Gestión de estado global (Zustand)
├── utils/             # Utilidades y funciones auxiliares
├── config/            # Configuración de servicios (Firebase, etc.)
└── hooks/             # Hooks personalizados de React
```

## 🔧 Funcionalidades Offline

### Datos Almacenados Localmente
- Catálogo de productos
- Categorías y subcategorías
- Información de usuarios y tiendas
- Lotes de inventario
- Historial de ventas (últimas 100)
- Clientes y proveedores

### Operaciones Sin Conexión
- Búsqueda y selección de productos
- Procesamiento de ventas
- Gestión de carrito
- Aplicación de descuentos
- Registro de notas en ventas

### Sincronización Automática
- Cuando se recupera la conexión
- Transacciones pendientes se envían al servidor
- Datos locales se actualizan con información del servidor
- Consistencia de datos garantizada

## 🔐 Seguridad

- Autenticación de usuarios con roles
- Protección de rutas según permisos
- Validación de datos en el servidor
- Protección contra accesos no autorizados

## 🎨 Diseño Responsivo

- Adaptado para móviles, tablets y escritorio
- Interfaz táctil optimizada para dispositivos móviles
- Modo oscuro/claro configurable
- Navegación intuitiva y eficiente

## 📞 Soporte y Mantenimiento

### Reporte de Problemas
Si encuentras algún problema o tienes sugerencias, por favor crea un issue en el repositorio.

### Contribuciones
Las contribuciones son bienvenidas. Por favor, sigue estos pasos:
1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/NuevaCaracteristica`)
3. Realiza tus cambios (`git commit -am 'Agrega nueva característica'`)
4. Sube tus cambios (`git push origin feature/NuevaCaracteristica`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- Gracias al equipo de desarrollo por su dedicación
- A los usuarios beta por sus valiosos comentarios
- A la comunidad de código abierto por las herramientas utilizadas

## 🧪 Pruebas

El proyecto incluye un sistema de pruebas basado en Vitest y Testing Library:

- Pruebas unitarias para componentes de UI
- Pruebas de integración
- Pruebas de renderizado de componentes
- Configuración lista para pruebas de estado con Zustand

Ejecutar pruebas:
```bash
npm run test:run  # Ejecutar pruebas una vez
npm run test      # Ejecutar pruebas en modo watch
```

## 🚀 Estado del Proyecto

**RECOOM POS** está completamente funcional con las siguientes características implementadas:

- ✅ **Sistema de Punto de Venta** completo con soporte offline
- ✅ **Gestión de inventario** distribuido por almacenes
- ✅ **Gestión de usuarios y roles** con diferentes permisos
- ✅ **Sistema de ventas** con tickets y pagos
- ✅ **Generación de reportes** detallados
- ✅ **Sistema de traslados** entre almacenes
- ✅ **Gestión de clientes y proveedores**
- ✅ **Funcionalidades PWA** para uso offline
- ✅ **Sistema de pruebas** configurado y funcional
- ✅ **Diseño responsive** para dispositivos móviles y de escritorio

---

**RECOOM POS** - Transformando la gestión de abarrotes para el futuro digital.