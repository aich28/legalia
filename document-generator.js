class DocumentGenerator {
  constructor() {
    this.templates = this.loadTemplates();
  }
  
  // Cargar plantillas de documentos
  loadTemplates() {
    return {
      recurso_reposicion: {
        name: 'Recurso de Reposición',
        sections: {
          header: 'AL [ORGANO_ADMINISTRATIVO]\n\n',
          intro: 'D./Dña. [NOMBRE], con NIF [NIF], y domicilio a efectos de notificaciones en [DOMICILIO], comparece y como mejor proceda en Derecho, EXPONE:\n\n',
          body: 'PRIMERO.- Que con fecha [FECHA_NOTIFICACION] me ha sido notificado/a [ACTO_IMPUGNADO], con número de referencia [REFERENCIA].\n\nSEGUNDO.- Que no estando conforme con dicho acto administrativo, mediante el presente escrito interpongo RECURSO DE REPOSICIÓN, en base a los siguientes\n\nHECHOS\n\nPRIMERO.- [HECHOS_ESPECIFICOS]\n\nFUNDAMENTOS DE DERECHO\n\nI. COMPETENCIA Y PROCEDIMIENTO\n[FUNDAMENTO_COMPETENCIA]\n\nII. MOTIVOS DE IMPUGNACIÓN\n[MOTIVOS_IMPUGNACION]\n\nIII. JURISPRUDENCIA APLICABLE\n[JURISPRUDENCIA]\n\n',
          closing: 'Por lo expuesto,\n\nSOLICITO: Que tenga por presentado este escrito, junto con los documentos que se acompañan, se sirva admitirlo, y en su virtud, acuerde [PETICION_CONCRETA].\n\nEn [LOCALIDAD], a [FECHA_ACTUAL].\n\nFdo.: [NOMBRE]'
        }
      },
      aplazamiento: {
        name: 'Solicitud de Aplazamiento',
        sections: {
          header: 'A LA DEPENDENCIA DE RECAUDACIÓN DE LA AEAT DE [LOCALIDAD]\n\n',
          intro: 'D./Dña. [NOMBRE], con NIF [NIF], y domicilio a efectos de notificaciones en [DOMICILIO], comparece y como mejor proceda en Derecho, EXPONE:\n\n',
          body: 'PRIMERO.- Que he recibido notificación de [TIPO_DEUDA] por importe de [IMPORTE] euros, con número de referencia [REFERENCIA], cuyo plazo de ingreso en período voluntario vence el [FECHA_VENCIMIENTO].\n\nSEGUNDO.- Que debido a dificultades económico-financieras de carácter transitorio, me resulta imposible hacer frente al pago de dicha deuda en el plazo establecido.\n\nTERCERO.- [EXPLICACION_SITUACION_ECONOMICA]\n\nFUNDAMENTOS DE DERECHO\n\nI. [FUNDAMENTOS_APLAZAMIENTO]\n\n',
          closing: 'Por lo expuesto,\n\nSOLICITO: Que tenga por presentada esta solicitud y, en su virtud, acuerde concederme un [APLAZAMIENTO/FRACCIONAMIENTO] del pago de la deuda por un periodo de [NUMERO] [MESES/AÑOS], con vencimientos [PERIODICIDAD] de [IMPORTE_FRACCION] euros.\n\nEn [LOCALIDAD], a [FECHA_ACTUAL].\n\nFdo.: [NOMBRE]'
        }
      },
      reclamacion_economico_administrativa: {
        name: 'Reclamación Económico-Administrativa',
        sections: {
          header: 'AL TRIBUNAL ECONÓMICO-ADMINISTRATIVO [REGIONAL/CENTRAL]\n\n',
          intro: 'D./Dña. [NOMBRE], con NIF [NIF], y domicilio a efectos de notificaciones en [DOMICILIO], comparece y como mejor proceda en Derecho, EXPONE:\n\n',
          body: 'PRIMERO.- Que con fecha [FECHA_NOTIFICACION] me ha sido notificado/a [ACTO_IMPUGNADO], con número de referencia [REFERENCIA], dictado por [ORGANO_EMISOR].\n\nSEGUNDO.- Que no estando conforme con dicho acto administrativo, mediante el presente escrito interpongo RECLAMACIÓN ECONÓMICO-ADMINISTRATIVA, en base a los siguientes\n\nHECHOS\n\nPRIMERO.- [HECHOS_ESPECIFICOS]\n\nFUNDAMENTOS DE DERECHO\n\nI. COMPETENCIA Y PROCEDIMIENTO\n[FUNDAMENTO_COMPETENCIA]\n\nII. MOTIVOS DE IMPUGNACIÓN\n[MOTIVOS_IMPUGNACION]\n\nIII. JURISPRUDENCIA APLICABLE\n[JURISPRUDENCIA]\n\n',
          closing: 'Por lo expuesto,\n\nSOLICITO: Que tenga por presentado este escrito, junto con los documentos que se acompañan, se sirva admitirlo, y en su virtud, acuerde [PETICION_CONCRETA].\n\nEn [LOCALIDAD], a [FECHA_ACTUAL].\n\nFdo.: [NOMBRE]'
        }
      }
    };
  }
  
  async generateDocument(documentType, caseData, legalAnalysis) {
    try {
      // Seleccionar plantilla
      const template = this.templates[documentType];
      if (!template) {
        throw new Error(`Tipo de documento no soportado: ${documentType}`);
      }
      
      // Preparar datos para la plantilla
      const documentData = this.prepareDocumentData(caseData, legalAnalysis);
      
      // Generar contenido personalizado
      const content = this.generateContent(template, documentData);
      
      // Generar documento según formato solicitado
      const format = documentData.preferredFormat || 'docx';
      
      if (format === 'docx') {
        return await this.generateDocx(template.name, content);
      } else if (format === 'txt') {
        return this.generateTxt(content);
      } else {
        throw new Error(`Formato no soportado: ${format}`);
      }
    } catch (error) {
      console.error('Error generando documento:', error);
      throw new Error('No se pudo generar el documento');
    }
  }
  
  // Preparar datos para la plantilla
  prepareDocumentData(caseData, legalAnalysis) {
    // Obtener fecha actual formateada
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    // Preparar datos combinando información del caso y análisis legal
    return {
      nombre: caseData.data.contribuyente || '[NOMBRE]',
      nif: caseData.data.nif || '[NIF]',
      domicilio: '[DOMICILIO]', // Solicitar al usuario
      fechaNotificacion: caseData.data.fechaNotificacion 
        ? new Date(caseData.data.fechaNotificacion).toLocaleDateString('es-ES')
        : '[FECHA_NOTIFICACION]',
      actoImpugnado: caseData.documentType === 'sancion' 
        ? 'la sanción tributaria' 
        : 'el acto administrativo',
      referencia: caseData.data.expediente || '[REFERENCIA]',
      importe: caseData.data.importe || '[IMPORTE]',
      organoAdministrativo: caseData.data.organoEmisor || 'DELEGACIÓN DE LA AEAT',
      localidad: '[LOCALIDAD]', // Solicitar al usuario
      fechaActual: formattedDate,
      motivosImpugnacion: this.generateImpugnacionText(legalAnalysis.errors),
      fundamentosLegales: this.generateLegalBasisText(legalAnalysis.errors),
      peticionConcreta: documentType === 'recurso_reposicion' 
        ? 'anular la sanción impuesta' 
        : 'conceder el aplazamiento solicitado',
      preferredFormat: 'docx'
    };
  }
  
  // Generar texto de motivos de impugnación basado en errores detectados
  generateImpugnacionText(errors) {
    if (!errors || errors.length === 0) {
      return '[DETALLAR MOTIVOS DE IMPUGNACIÓN]';
    }
    
    let text = '';
    errors.forEach((error, index) => {
      text += `${index + 1}. ${error.description}.\n`;
    });
    
    return text;
  }
  
  // Generar texto de fundamentos legales basado en errores detectados
  generateLegalBasisText(errors) {
    if (!errors || errors.length === 0) {
      return '[DETALLAR FUNDAMENTOS LEGALES]';
    }
    
    let text = '';
    const uniqueBases = [...new Set(errors.map(e => e.legalBasis))];
    
    uniqueBases.forEach((basis, index) => {
      text += `${index + 1}. ${basis}.\n`;
    });
    
    return text;
  }
  
  // Generar contenido completo del documento
  generateContent(template, data) {
    let content = '';
    
    // Combinar secciones de la plantilla
    for (const section in template.sections) {
      let sectionText = template.sections[section];
      
      // Reemplazar variables con datos reales
      for (const key in data) {
        const placeholder = `[${key.toUpperCase()}]`;
        sectionText = sectionText.replace(new RegExp(placeholder, 'g'), data[key]);
      }
      
      content += sectionText;
    }
    
    return content;
  }
  
  // Generar documento Word
  async generateDocx(title, content) {
    // Usar docx.js para generar documento Word
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: this.parseContentToDocxElements(content)
      }]
    });
    
    // Generar archivo
    const buffer = await docx.Packer.toBlob(doc);
    return {
      fileName: `${title.replace(/\s+/g, '_')}.docx`,
      blob: buffer,
      content: content // Para previsualización
    };
  }
  
  // Convertir texto a elementos docx
  parseContentToDocxElements(content) {
    // Dividir por líneas
    const lines = content.split('\n');
    const elements = [];
    
    lines.forEach(line => {
      if (line.trim() === '') {
        // Línea vacía
        elements.push(new docx.Paragraph({}));
      } else if (line.toUpperCase() === line && line.trim().length > 0) {
        // Título (texto en mayúsculas)
        elements.push(
          new docx.Paragraph({
            text: line,
            heading: docx.HeadingLevel.HEADING_2,
            bold: true
          })
        );
      } else {
        // Texto normal
        elements.push(
          new docx.Paragraph({
            text: line
          })
        );
      }
    });
    
    return elements;
  }
  
  // Generar documento de texto plano
  generateTxt(content) {
    return {
      fileName: 'documento.txt',
      content: content,
      text: content
    };
  }
}
