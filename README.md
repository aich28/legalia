# Documentación del Asistente Legal Inteligente

## Descripción General

El Asistente Legal Inteligente es una aplicación web diseñada para ayudar a particulares, autónomos y empresas en sus trámites ante la AEAT y otros órganos administrativos. El sistema analiza documentos legales, detecta errores o deficiencias, calcula plazos legales y genera documentos de respuesta personalizados.

## Estructura de Archivos

El proyecto está organizado de la siguiente manera:

```
legaldefense/
├── index.html          # Página principal con la interfaz de usuario
├── js/
│   ├── app.js                    # Módulo principal de la aplicación
│   ├── document-processor.js     # Procesamiento de documentos
│   ├── legal-analyzer.js         # Análisis legal y detección de errores
│   ├── document-generator.js     # Generación de documentos personalizados
│   └── deadline-calculator.js    # Cálculo de plazos legales
```

## Funcionalidades Implementadas

### 1. Procesamiento de Documentos
- Carga y validación de documentos (PDF, DOCX, JPG, PNG)
- Extracción de texto y datos clave
- Detección automática del tipo de documento

### 2. Análisis Legal
- Detección de errores formales, procedimentales y de cálculo
- Consulta de normativa y jurisprudencia aplicable
- Evaluación de estrategias legales
- Cálculo de probabilidad de éxito

### 3. Cálculo de Plazos
- Cálculo de fechas límite para diferentes acciones legales
- Verificación de vencimiento de plazos
- Cálculo de días restantes

### 4. Generación de Documentos
- Creación de escritos de alegaciones
- Generación de recursos de reposición
- Elaboración de solicitudes de aplazamiento/fraccionamiento
- Preparación de reclamaciones económico-administrativas

### 5. Interfaz de Usuario
- Asistente interactivo con chat
- Carga de documentos mediante drag & drop
- Visualización de resultados del análisis
- Vista previa de documentos generados

## Guía de Uso

### Iniciar el Asistente
1. Abrir la página web en un navegador
2. Hacer clic en el botón "Empezar ahora" o en el icono del asistente en la esquina inferior derecha

### Analizar un Documento
1. Seleccionar la opción "Analizar un documento"
2. Arrastrar y soltar el documento o hacer clic para seleccionarlo
3. Esperar a que el sistema procese el documento y muestre los resultados
4. Revisar los errores detectados y la estrategia recomendada

### Generar un Documento
1. Seleccionar la opción legal deseada entre las presentadas
2. Revisar la vista previa del documento generado
3. Descargar el documento en formato Word o PDF

### Consultar sin Documento
1. Seleccionar la opción "Consultar sin documento"
2. Describir el caso o seleccionar una de las opciones predefinidas
3. Seguir las instrucciones del asistente para obtener orientación

## Detalles Técnicos

### Módulo Principal (app.js)
Este módulo gestiona la interfaz de usuario y coordina la interacción entre los diferentes componentes del sistema. Implementa el flujo de conversación del asistente y maneja los eventos de usuario.

### Procesamiento de Documentos (document-processor.js)
Encargado de la validación, extracción de texto y análisis inicial de los documentos subidos por el usuario. Identifica el tipo de documento y extrae datos clave como nombres, fechas, importes y referencias.

### Análisis Legal (legal-analyzer.js)
Realiza un análisis profundo del documento para detectar posibles errores o deficiencias que puedan ser impugnados. Consulta la normativa aplicable y evalúa las mejores estrategias legales para cada caso.

### Generación de Documentos (document-generator.js)
Crea documentos personalizados basados en plantillas predefinidas, adaptándolos a los datos específicos de cada caso y a los errores detectados. Permite la exportación en diferentes formatos.

### Cálculo de Plazos (deadline-calculator.js)
Calcula los plazos legales para diferentes acciones, teniendo en cuenta días hábiles y festivos. Determina fechas límite y alerta sobre plazos próximos a vencer.

## Notas de Implementación

- El sistema utiliza JavaScript puro sin dependencias externas para mayor compatibilidad
- La interfaz está diseñada con Tailwind CSS para un diseño responsive
- Se han implementado simulaciones para el procesamiento de documentos y análisis legal
- En una implementación real, se recomienda integrar bibliotecas como pdf.js, docx.js o tesseract.js para el procesamiento de documentos
- El sistema está preparado para funcionar tanto en dispositivos de escritorio como en móviles

## Posibles Mejoras Futuras

1. Implementación de procesamiento real de documentos con OCR
2. Integración con bases de datos de normativa y jurisprudencia actualizadas
3. Añadir autenticación de usuarios para guardar historial de casos
4. Implementar notificaciones de plazos próximos a vencer
5. Añadir más tipos de documentos y plantillas de respuesta
