# 🤖 Agentes de Qwen para OrbitaPlay

Este directorio contiene las configuraciones para diferentes agentes especializados que puedes usar en tu proyecto OrbitaPlay. Cada agente está especializado en un área específica del desarrollo.

## 📋 Agentes Disponibles

### 1. Team Lead (Project Manager) (`project-manager.json`)
- **Especialidad**: Planificación de Proyectos, Gestión de Flujo de Trabajo, Delegación de Tareas y Automatización con MCP Tools
- **Rol**: Project Manager y líder del equipo de desarrollo
- **Uso**: Punto de contacto único que recibe solicitudes del usuario, crea planes, delega subtareas a agentes especializados y coordina con MCP tools para automatizar tareas repetitivas

### 2. React Mentor (`react-mentor.json`)
- **Especialidad**: Desarrollo con React 18+, TypeScript, Tailwind CSS
- **Rol**: Mentor de ingeniería de React
- **Uso**: Ideal para preguntas sobre componentes React, estado, rendimiento, pruebas y buenas prácticas

### 3. CSS/Tailwind Specialist (`css-tailwind-specialist.json`)
- **Especialidad**: Estilos CSS, Tailwind, diseño responsivo, accesibilidad
- **Rol**: Especialista en estilos y UI/UX
- **Uso**: Perfecto para temas de diseño, interfaz de usuario y estilos

### 4. Backend & API Specialist (`backend-api-specialist.json`)
- **Especialidad**: Desarrollo backend, diseño de APIs, seguridad, bases de datos
- **Rol**: Experto en backend y APIs
- **Uso**: Útil para preguntas sobre APIs, seguridad, bases de datos y servidores

### 5. POS Domain Expert (`pos-domain-expert.json`)
- **Especialidad**: Sistemas de punto de venta, procesamiento de transacciones, inventario, cálculos fiscales y descuentos
- **Rol**: Experto en dominio de POS con enfoque en arquitectura offline-first
- **Uso**: Ideal para preguntas específicas del negocio de punto de venta e integración con Supabase

### 6. React Testing Agent (Jestina) (`react-testing-agent.json`)
- **Especialidad**: Testing en React (Jest, React Testing Library, Cypress)
- **Rol**: Especialista en pruebas unitarias e integración
- **Uso**: Perfecto para escribir y revisar pruebas de componentes y funcionalidades

### 7. React Documentation Agent (DocuReact) (`react-documentation-agent.json`)
- **Especialidad**: Documentación de componentes con Storybook, JSDoc
- **Rol**: Especialista en documentación de código
- **Uso**: Ideal para crear documentación clara y completa de componentes y APIs

### 8. React Architecture Agent (ArchiReact) (`react-architecture-agent.json`)
- **Especialidad**: Arquitectura de proyectos, estructura y patrones de diseño con enfoque POS
- **Rol**: Especialista en arquitectura de aplicaciones React con patrones offline-first
- **Uso**: Perfecto para definir estructura de proyecto, patrones de diseño y arquitectura escalable

### 9. Tailwind Specialist Agent (TailwindMaster) (`tailwind-specialist-agent.json`)
- **Especialidad**: Configuración de Tailwind, sistemas de diseño, responsive
- **Rol**: Especialista en estilos y diseño con Tailwind CSS
- **Uso**: Ideal para crear sistemas de diseño y estilos responsive

## 🚀 Cómo Usar

### Opción 1: Usar el Team Lead (Project Manager)

Puedes interactuar directamente con el Team Lead para que él gestione la planificación, delegación de tareas y automatización con MCP tools:

- **Comando**: `qwen --agent project-manager`
- **Uso**: Ideal para tareas complejas que requieran múltiples especialidades. El Team Lead recibirá tu solicitud global, creará un plan, delegará las subtareas a los agentes especializados más adecuados y coordinará con MCP tools para automatizar procesos repetitivos.

### Opción 2: Usar agentes específicos

Cuando necesites ayuda con una tarea específica, puedes referenciar al agente más apropiado:

- Para temas de React (general): Menciona al "React Mentor"
- Para estilos y UI: Menciona al "CSS/Tailwind Specialist" o "TailwindMaster"
- Para backend/APIs: Menciona al "Backend & API Specialist"
- Para temas específicos de POS: Menciona al "POS Domain Expert"
- Para pruebas y testing: Menciona a "Jestina"
- Para documentación: Menciona a "DocuReact"
- Para arquitectura: Menciona a "ArchiReact"

## 💡 Integración con MCP Tools

Muchos agentes pueden coordinarse con herramientas MCP para automatizar tareas:

- **Investigación**: `tavily-search` para investigación de requisitos
- **Operaciones de base de datos**: `supabase-mcp` para operaciones de base de datos
- **Pruebas de UI**: `chrome-devtools` para pruebas de interfaz
- **Control de versiones**: `git-mcp-server` para operaciones de git
- **Documentación**: `context7-mcp` para documentación y referencias técnicas
- **Automatización personalizada**: `fastmcp` para workflows personalizados

## 🛠 Personalización

Puedes modificar cualquiera de estos archivos para adaptar el comportamiento del agente a tus necesidades específicas. Puedes ajustar las especialidades, el tono, las preferencias técnicas y las directrices de respuesta.

## 📝 Instrucciones Adicionales

Los agentes también pueden incluir instrucciones de personalidad en archivos `.md` (como `react-mentor-instructions.md`).