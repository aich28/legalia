// 📁 legal-analyzer.js

/**
 * LegalDefense AI – Asistente Legal Inteligente
 * Módulo de análisis legal
 */

const LegalAnalyzer = {
  // Analiza el documento y detecta errores jurídicos simulados
  detectErrors: function (documentData, documentType) {
    return new Promise((resolve) => {
      // 🕒 Simula análisis tras medio segundo
      setTimeout(() => {
        const errors = [
          {
            tipo: 'procedimental',
            descripcion: 'No se ha respetado el plazo mínimo de 10 días para presentar alegaciones previas.',
            articulo: '96.6',
            ley: 'RD 1065/2007',
            gravedad: 'alta'
          },
          {
            tipo: 'cálculo',
            descripcion: 'Se han aplicado intereses de demora desde una fecha incorrecta.',
            articulo: '26.3',
            ley: 'Ley 58/2003',
            gravedad: 'media'
          },
          {
            tipo: 'formal',
            descripcion: 'Falta la motivación suficiente en el acto administrativo, lo cual puede vulnerar el derecho a una defensa adecuada.',
            articulo: '35',
            ley: 'Ley 39/2015',
            gravedad: 'alta'
          },
          {
            tipo: 'notificación',
            descripcion: 'La notificación no indica adecuadamente el plazo ni las vías de recurso, lo cual puede afectar a la seguridad jurídica.',
            articulo: '40.2',
            ley: 'Ley 39/2015',
            gravedad: 'media'
          }
        ];

        resolve(errors);
      }, 500);
    });
  }
};

export default LegalAnalyzer;
