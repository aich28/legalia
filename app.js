<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Asistente Legal Tributario</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      margin: 0;
      background-color: #f1f4f9;
    }
    header {
      background-color: #003366;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    nav a {
      color: white;
      margin-left: 1rem;
      text-decoration: none;
      font-weight: 500;
    }
    .container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h2 {
      color: #003366;
    }
    textarea, pre {
      width: 100%;
      padding: 1rem;
      font-family: monospace;
      font-size: 14px;
      border-radius: 6px;
      background: #f9f9f9;
      border: 1px solid #ccc;
    }
    button {
      background-color: #0066cc;
      color: white;
      border: none;
      padding: 0.7rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    #status {
      font-weight: bold;
      margin-top: 1rem;
      color: #444;
    }
    .analysis-block {
      margin-top: 2rem;
    }
    footer {
      text-align: center;
      font-size: 13px;
      color: #666;
      margin-top: 4rem;
      padding: 1rem;
    }
    .spinner {
      display: none;
      margin: 1rem auto;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #003366;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <header>
    <h1>🧾 Asistente Legal Tributario</h1>
    <nav>
      <a href="#">Inicio</a>
      <a href="#">Normativa</a>
      <a href="#">Contacto</a>
    </nav>
  </header>

  <div class="container">
    <h2>📤 Subir Documento Fiscal o Legal</h2>
    <input type="file" id="file-input" accept=".pdf,.png,.jpg,.jpeg,.docx" />
    <button id="analyze-btn">Analizar Documento</button>
    <p id="status"></p>
    <div class="spinner" id="spinner"></div>
    <div id="result"></div>
  </div>

  <footer>
    © 2025 Appgile Asistente Legal. Todos los derechos reservados.
  </footer>

  <script type="module" src="./app.js"></script>
  <script>
    const spinner = document.getElementById('spinner');
    const statusText = document.getElementById('status');

    const showLoading = (message) => {
      statusText.innerText = message;
      spinner.style.display = 'block';
    };

    const hideLoading = () => {
      spinner.style.display = 'none';
    };

    // Exponer estas funciones para uso dentro de app.js si se desea
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
  </script>
</body>
</html>
