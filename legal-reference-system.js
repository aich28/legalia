class LegalReferenceSystem {
  constructor() {
    this.sources = this.initializeSources();
  }
  
  // Inicializar fuentes de información legal
  initializeSources() {
    return {
      // Normativa tributaria básica
      tributaria: [
        {
          id: 'lgt',
          name: 'Ley 58/2003, General Tributaria',
          url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186',
          articles: {
            '26': 'Interés de demora',
            '27': 'Recargos por declaración extemporánea',
            '62': 'Plazos para el pago',
            '65': 'Aplazamiento y fraccionamiento del pago',
            '222': 'Recurso de reposición',
            '226': 'Reclamaciones económico-administrativas'
          }
        },
        {
          id: 'rgr',
          name: 'Real Decreto 939/2005, Reglamento General de Recaudación',
          url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2005-14803',
          articles: {
            '44': 'Aplazamiento y fraccionamiento del pago',
            '46': 'Solicitud de aplazamiento',
            '48': 'Garantías en aplazamientos'
          }
        },
        {
          id: 'rgrva',
          name: 'Real Decreto 520/2005, Reglamento de revisión en vía administrativa',
          url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2005-8662',
          articles: {
            '4': 'Recurso de reposición',
            '23': 'Procedimiento en reclamaciones económico-administrativas'
          }
        }
      ],
      
      // Normativa administrativa general
      administrativa: [
        {
          id: 'lpac',
          name: 'Ley 39/2015, Procedimiento Administrativo Común',
          url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565',
          articles: {
            '30': 'Cómputo de plazos',
            '35': 'Motivación',
            '40': 'Notificaciones',
            '112': 'Recursos administrativos',
            '123': 'Recurso de alzada',
            '124': 'Recurso de reposición'
          }
        }
      ],
      
      // Jurisprudencia relevante
      jurisprudencia: [
        {
          id: 'sts_2019_1234',
          name: 'STS 1234/2019, de 15 de mayo',
          url: 'https://www.poderjudicial.es/search/indexAN.jsp',
          summary: 'Sobre la necesidad de motivación en sanciones tributarias',
          relevantTo: ['sancion_iva', 'sancion_irpf', 'sancion_generica']
        },
        {
          id: 'sts_2020_4567',
          name: 'STS 4567/2020, de 10 de noviembre',
          url: 'https://www.poderjudicial.es/search/indexAN.jsp',
          summary: 'Sobre defectos formales en notificaciones tributarias',
          relevantTo: ['liquidacion_iva', 'liquidacion_irpf', 'liquidacion_generica']
        }
      ],
      
      // Doctrina administrativa
      doctrina: [
        {
          id: 'teac_2021_1234',
          name: 'Resolución TEAC 1234/2021, de 20 de enero',
          url: 'https://serviciostelematicosext.hacienda.gob.es/TEAC/',
          summary: 'Sobre cálculo de intereses de demora en aplazamientos',
          relevantTo: ['aplazamiento']
        },
        {
          id: 'dgt_v1234_2022',
          name: 'Consulta Vinculante DGT V1234-22',
          url: 'https://petete.tributos.hacienda.gob.es/',
          summary: 'Sobre requisitos para aplazamiento por dificultades económicas',
          relevantTo: ['aplazamiento']
        }
      ]
    };
  }
  
  // Buscar referencias legales relevantes para un caso específico
  findRelevantReferences(procedureType, errorTypes = []) {
    const relevantReferences = {
      normativa: [],
      jurisprudencia: [],
      doctrina: []
    };
    
    // Buscar normativa relevante según tipo de procedimiento
    this.findRelevantNormativa(procedureType, relevantReferences);
    
    // Buscar jurisprudencia relevante
    this.findRelevantJurisprudencia(procedureType, relevantReferences);
    
    // Buscar doctrina administrativa relevante
    this.findRelevantDoctrina(procedureType, relevantReferences);
    
    // Si hay errores específicos, añadir referencias adicionales
    if (errorTypes.length > 0) {
      this.findReferencesForErrors(errorTypes, relevantReferences);
    }
    
    return relevantReferences;
  }
  
  // Buscar normativa relevante
  findRelevantNormativa(procedureType, references) {
    // Normativa común para todos los procedimientos
    const commonSources = ['lgt', 'lpac'];
    
    // Normativa específica según tipo de procedimiento
    const specificSources = {
      'sancion_iva': ['rgrva'],
      'sancion_irpf': ['rgrva'],
      'sancion_generica': ['rgrva'],
      'liquidacion_iva': ['rgr'],
      'liquidacion_irpf': ['rgr'],
      'liquidacion_generica': ['rgr'],
      'aplazamiento': ['rgr']
    };
    
    // Añadir fuentes comunes
    commonSources.forEach(sourceId => {
      const source = this.findSourceById(sourceId);
      if (source) {
        references.normativa.push({
          id: source.id,
          name: source.name,
          url: source.url,
          relevantArticles: this.getRelevantArticles(source, procedureType)
        });
      }
    });
    
    // Añadir fuentes específicas
    if (specificSources[procedureType]) {
      specificSources[procedureType].forEach(sourceId => {
        const source = this.findSourceById(sourceId);
        if (source) {
          references.normativa.push({
            id: source.id,
            name: source.name,
            url: source.url,
            relevantArticles: this.getRelevantArticles(source, procedureType)
          });
        }
      });
    }
  }
  
  // Buscar jurisprudencia relevante
  findRelevantJurisprudencia(procedureType, references) {
    this.sources.jurisprudencia.forEach(jurisprudencia => {
      if (jurisprudencia.relevantTo.includes(procedureType)) {
        references.jurisprudencia.push({
          id: jurisprudencia.id,
          name: jurisprudencia.name,
          url: jurisprudencia.url,
          summary: jurisprudencia.summary
        });
      }
    });
  }
  
  // Buscar doctrina administrativa relevante
  findRelevantDoctrina(procedureType, references) {
    this.sources.doctrina.forEach(doctrina => {
      if (doctrina.relevantTo.includes(procedureType)) {
        references.doctrina.push({
          id: doctrina.id,
          name: doctrina.name,
          url: doctrina.url,
          summary: doctrina.summary
        });
      }
    });
  }
  
  // Buscar referencias adicionales para errores específicos
  findReferencesForErrors(errorTypes, references) {
    // Mapeo de tipos de error a artículos relevantes
    const errorToArticles = {
      'falta_firma': { source: 'lpac', articles: ['40'] },
      'falta_pie_recurso': { source: 'lpac', articles: ['40', '112'] },
      'falta_identificacion': { source: 'lgt', articles: ['9'] },
      'falta_audiencia': { source: 'lpac', articles: ['82'] },
      'notificacion_defectuosa': { source: 'lpac', articles: ['40', '41', '42', '43', '44'] },
      'falta_motivacion': { source: 'lpac', articles: ['35'] },
      'error_calculo_intereses': { source: 'lgt', articles: ['26'] },
      'error_calculo_sancion': { source: 'lgt', articles: ['191', '192', '193', '194', '195'] }
    };
    
    // Añadir referencias específicas para cada tipo de error
    errorTypes.forEach(errorType => {
      if (errorToArticles[errorType]) {
        const { source: sourceId, articles } = errorToArticles[errorType];
        const source = this.findSourceById(sourceId);
        
        if (source) {
          // Verificar si ya existe esta fuente en las referencias
          const existingSource = references.normativa.find(ref => ref.id === sourceId);
          
          if (existingSource) {
            // Añadir artículos adicionales si no están ya incluidos
            articles.forEach(article => {
              if (!existingSource.relevantArticles.find(a => a.number === article)) {
                existingSource.relevantArticles.push({
                  number: article,
                  title: source.articles[article] || 'Artículo relevante'
                });
              }
            });
          } else {
            // Añadir nueva fuente con artículos relevantes
            references.normativa.push({
              id: source.id,
              name: source.name,
              url: source.url,
              relevantArticles: articles.map(article => ({
                number: article,
                title: source.articles[article] || 'Artículo relevante'
              }))
            });
          }
        }
      }
    });
  }
  
  // Encontrar fuente por ID
  findSourceById(sourceId) {
    for (const category in this.sources) {
      const found = this.sources[category].find(source => source.id === sourceId);
      if (found) return found;
    }
    return null;
  }
  
  // Obtener artículos relevantes de una fuente
  getRelevantArticles(source, procedureType) {
    // Mapeo de tipos de procedimiento a artículos relevantes
    const procedureToArticles = {
      'sancion_iva': ['26', '27', '222', '226'],
      'sancion_irpf': ['26', '27', '222', '226'],
      'sancion_generica': ['26', '27', '222', '226'],
      'liquidacion_iva': ['62', '222', '226'],
      'liquidacion_irpf': ['62', '222', '226'],
      'liquidacion_generica': ['62', '222', '226'],
      'aplazamiento': ['65', '44', '46', '48'],
      'requerimiento_informacion': ['30', '112'],
      'requerimiento_generico': ['30', '112'],
      'acta_inspeccion': ['35', '112']
    };
    
    const relevantArticleNumbers = procedureToArticles[procedureType] || [];
    const relevantArticles = [];
    
    relevantArticleNumbers.forEach(articleNumber => {
      if (source.articles && source.articles[articleNumber]) {
        relevantArticles.push({
          number: articleNumber,
          title: source.articles[articleNumber]
        });
      }
    });
    
    return relevantArticles;
  }
  
  // Consultar normativa en tiempo real (simulado)
  async consultLiveSource(sourceType, query) {
    console.log(`Consultando fuente en tiempo real: ${sourceType}, query: ${query}`);
    
    // En una implementación real, aquí se conectaría con APIs externas
    // Para esta simulación, devolvemos datos predefinidos
    
    return {
      success: true,
      message: 'Consulta simulada completada',
      results: [
        {
          title: `Resultado de búsqueda para "${query}"`,
          url: 'https://ejemplo.com/resultado',
          snippet: 'Este es un resultado simulado de la consulta en tiempo real...'
        }
      ]
    };
  }
  
  // Formatear referencias para mostrar al usuario
  formatReferencesForDisplay(references) {
    let formattedText = '📚 **Referencias Legales Relevantes**\n\n';
    
    // Formatear normativa
    if (references.normativa.length > 0) {
      formattedText += '**Normativa Aplicable:**\n';
      references.normativa.forEach(norm => {
        formattedText += `- [${norm.name}](${norm.url})\n`;
        if (norm.relevantArticles && norm.relevantArticles.length > 0) {
          formattedText += '  Artículos relevantes:\n';
          norm.relevantArticles.forEach(article => {
            formattedText += `  • Art. ${article.number}: ${article.title}\n`;
          });
        }
      });
      formattedText += '\n';
    }
    
    // Formatear jurisprudencia
    if (references.jurisprudencia.length > 0) {
      formattedText += '**Jurisprudencia Relevante:**\n';
      references.jurisprudencia.forEach(juris => {
        formattedText += `- [${juris.name}](${juris.url}): ${juris.summary}\n`;
      });
      formattedText += '\n';
    }
    
    // Formatear doctrina
    if (references.doctrina.length > 0) {
      formattedText += '**Doctrina Administrativa:**\n';
      references.doctrina.forEach(doc => {
        formattedText += `- [${doc.name}](${doc.url}): ${doc.summary}\n`;
      });
    }
    
    return formattedText;
  }
}
