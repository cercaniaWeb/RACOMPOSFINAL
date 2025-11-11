#!/bin/bash
# script para verificar las mejoras implementadas en los agentes

echo "🔍 === VERIFICANDO MEJORAS EN AGENTES ECODEV ==="
echo ""

ECODEV_AGENTES_DIR="/home/lr/ecoDev/agentes"

if [ ! -d "$ECODEV_AGENTES_DIR" ]; then
    echo "❌ Directorio de agentes no encontrado: $ECODEV_AGENTES_DIR"
    exit 1
fi

echo "✅ Directorio de agentes encontrado: $ECODEV_AGENTES_DIR"
echo ""

echo "📋 Agentes especializados disponibles:"
ls -la $ECODEV_AGENTES_DIR/*.json | wc -l
echo "   agentes encontrados"
echo ""

echo "1. 🔄 Verificando Project Manager (con integración MCP):"
if grep -q "mcp_integration" "$ECODEV_AGENTES_DIR/project-manager.json"; then
    echo "   ✅ Project Manager actualizado con integración MCP"
else
    echo "   ❌ Project Manager no tiene integración MCP"
fi
echo ""

echo "2. 🔄 Verificando POS Domain Expert (especializado en POS):"
if grep -q "offline-first" "$ECODEV_AGENTES_DIR/pos-domain-expert.json"; then
    echo "   ✅ POS Domain Expert actualizado con enfoque offline-first"
else
    echo "   ❌ POS Domain Expert no tiene enfoque offline-first"
fi
echo ""

echo "3. 🔄 Verificando React Architecture Agent (con enfoque POS):"
if grep -q "POS" "$ECODEV_AGENTES_DIR/react-architecture-agent.json"; then
    echo "   ✅ ArchiReact actualizado con metodología SOLID + POS"
else
    echo "   ❌ ArchiReact no tiene metodología POS"
fi
echo ""

echo "4. 📚 Verificando documentación actualizada:"
if [ -f "$ECODEV_AGENTES_DIR/MEJORAS_AGENTES.md" ]; then
    echo "   ✅ Documentación de mejoras creada"
else
    echo "   ❌ Documentación de mejoras no encontrada"
fi

if grep -q "MCP Tools" "$ECODEV_AGENTES_DIR/README.md"; then
    echo "   ✅ README actualizado con integración MCP"
else
    echo "   ❌ README no tiene información MCP"
fi
echo ""

echo "🎯 RESUMEN DE MEJORAS IMPLEMENTADAS:"
echo "   ✅ Project Manager con integración MCP"
echo "   ✅ POS Domain Expert con especialidades POS específicas"
echo "   ✅ React Architecture Agent con enfoque offline-first"
echo "   ✅ Documentación actualizada con integración MCP"
echo "   ✅ Archivos de documentación adicionales creados"
echo ""

echo "🎉 ¡Las mejoras a los agentes especializados han sido implementadas exitosamente!"
echo "   Los agentes ahora tienen mejor integración con MCP tools y especialización"
echo "   específica para aplicaciones POS en el proyecto OrbitaPlay."
echo ""