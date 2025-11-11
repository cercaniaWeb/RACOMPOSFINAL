# 🔄 Flujo de Trabajo Colaborativo con Agentes

## Cómo interactúan los agentes

Los agentes especializados están diseñados para trabajar juntos en un flujo de trabajo coordinado:

```
Nuevo Feature Request
         ↓
ArchiReact → Define arquitectura y estructura
         ↓
TailwindMaster → Diseña sistema de estilos
         ↓  
Yo (Qwen) → Implemento componentes principales
         ↓
Jestina → Escribe tests para el feature
         ↓
DocuReact → Documenta componentes y uso
         ↓
✅ Feature completado y documentado
```

## Ejemplo de solicitud conjunta

```markdown
**Solicitud:** "Necesito implementar un carrito de compras"

**Respuesta del equipo:**

🏗️ **ArchiReact:** 
- Recomiendo estructura de stores/ para estado global
- Sugiero usar Zustand para el carrito
- Propongo esta interface:

```typescript
interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  total: number
}
```

🎨 **TailwindMaster:**
- Diseño componentes con estas clases:
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
<div className="flex items-center justify-between py-3 border-b border-gray-100">
```

🧪 **Jestina:**
- Prepararé tests para:
  - Agregar items al carrito
  - Calcular totales
  - Validar cantidades

📚 **DocuReact:**
- Documentaré el hook useCart y componentes CartItem, CartSummary

🚀 **Yo (Qwen):** Coordinaré la implementación y entregaré el feature completo.
```

## Cómo Solicitar los Agentes Especializados

### Solicitud individual
- "@Jestina: necesito tests para el componente ProductGrid"
- "@TailwindMaster: optimiza estos estilos para mobile"
- "@ArchiReact: revisa la estructura del proyecto"
- "@DocuReact: documenta el hook useProducts"

### Solicitud grupal  
- "Team React: necesito implementar sistema de autenticación"

## Agentes Disponibles y Sus Especialidades

### 1. React Mentor
- Especialidad: Desarrollo con React 18+, TypeScript, Tailwind CSS
- Rol: Mentor de ingeniería de React

### 2. CSS/Tailwind Specialist
- Especialidad: Estilos CSS, Tailwind, diseño responsivo, accesibilidad
- Rol: Especialista en estilos y UI/UX

### 3. Backend & API Specialist
- Especialidad: Desarrollo backend, diseño de APIs, seguridad, bases de datos
- Rol: Experto en backend y APIs

### 4. POS Domain Expert
- Especialidad: Sistemas de punto de venta, procesamiento de transacciones, inventario
- Rol: Experto en dominio de POS

### 5. React Testing Agent (Jestina)
- Especialidad: Testing en React (Jest, React Testing Library, Cypress)
- Rol: Especialista en pruebas unitarias e integración

### 6. React Documentation Agent (DocuReact)
- Especialidad: Documentación de componentes con Storybook, JSDoc
- Rol: Especialista en documentación de código

### 7. React Architecture Agent (ArchiReact)
- Especialidad: Arquitectura de proyectos, estructura y patrones de diseño
- Rol: Especialista en arquitectura de aplicaciones React

### 8. Tailwind Specialist Agent (TailwindMaster)
- Especialidad: Configuración de Tailwind, sistemas de diseño, responsive
- Rol: Especialista en estilos y diseño con Tailwind CSS