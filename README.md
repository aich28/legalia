# 🧾 Manual del Proyecto: Asistente Legal Tributario con IA

Este proyecto es una solución web desarrollada para permitir a usuarios subir documentos fiscales o jurídicos (PDF, imagen o DOCX) y recibir automáticamente una respuesta legal redactada por un asistente de inteligencia artificial especializado en normativa tributaria española.

---

## 🛠️ Estructura del Proyecto

| Archivo                        | Función                                                                 |
|-------------------------------|------------------------------------------------------------------------|
| `index.html`                  | Interfaz de usuario con diseño visual responsive usando Tailwind CSS   |
| `app.js`                      | Controlador principal: gestiona la carga del archivo, procesamiento y visualización de resultados |
| `document-processor.js`       | Extrae texto del documento usando Google Cloud Vision OCR              |
| `legal-analyzer.js`           | Envía el texto al asistente GPT-4o en Platform para análisis legal     |
| `document-generator.js`       | Genera borradores legales (recurso, aplazamiento, reclamación)         |
| `deadline-calculator.js`      | Calcula plazos legales según normativa administrativa española         |
| `legal-reference-system.js`   | Proporciona citas legales relevantes de normativa oficial               |

---

## ⚙️ Funcionalidad del Asistente

1. **Carga de archivo**: El usuario puede subir un documento arrastrándolo o haciendo clic en el botón.
2. **OCR y extracción de texto**: Si el archivo es imagen o PDF escaneado, el texto se extrae con la API de Google Cloud Vision.
3. **Análisis legal**: El texto se envía a un asistente configurado en GPT Platform (`asst_yKlwg3LaE9vZSnqMJZF5aLnm`), que analiza el contenido y genera:
   - Resumen jurídico
   - Fechas clave y artículos aplicables
   - Redacción de una respuesta estructurada
4. **Generación de documento legal (opcional)**: Si se activa, puede generarse un escrito descargable en base a plantillas personalizadas.

---

## 🚀 Cómo Desplegar

### ✅ Replit
1. Crear nuevo Repl: HTML/CSS/JS
2. Subir todos los archivos
3. Hacer clic en “Run”

### ✅ Netlify (Drop)
1. Ir a [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastrar el `.zip` del proyecto
3. Obtener un enlace público en segundos

---

## 🔐 Seguridad

⚠️ El proyecto usa una API Key de OpenAI y Google Cloud.  
Estas claves están en `legal-analyzer.js` y `document-processor.js`.  
Si el proyecto va a estar en producción:
- Usar funciones backend (Node.js o Cloud Functions)
- O configurar restricciones en las claves desde las consolas de Google y OpenAI

---

## 🧩 Personalización

- Puedes editar el archivo `document-generator.js` para adaptar los modelos legales al estilo de tu despacho.
- Puedes ampliar la base de jurisprudencia en `legal-reference-system.js`
- Estilo y marca visual en `index.html` (colores, íconos, textos)

---

## 👨‍💻 Autor y soporte

Este proyecto ha sido diseñado por Ana con la asistencia de IA para profesionales del derecho fiscal.

---

