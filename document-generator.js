/**
 * LegalDefense AI - Asistente Legal Inteligente
 * Módulo de generación de documentos
 */

// Funciones para generar documentos legales personalizados
const DocumentGenerator = {
    // Genera un documento de alegaciones
    generateAllegationsDocument: function(documentData, errors, strategy) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // En una implementación real, se utilizaría una plantilla más compleja
                // y se personalizaría con los datos específicos del caso
                
                const documentContent = `
                    <div class="text-right mb-4">
                        <p class="text-gray-800">${documentData.organoEmisor.toUpperCase()}</p>
                        <p class="text-gray-800">AGENCIA TRIBUTARIA</p>
                        <p class="text-gray-800">C/ Guzmán el Bueno, 139</p>
                        <p class="text-gray-800">28003 Madrid</p>
                    </div>
                    <div class="text-center mb-6">
                        <p class="text-gray-800 font-bold">ESCRITO DE ALEGACIONES</p>
                    </div>
                    <p class="text-gray-800 mb-4">D/Dña ${documentData.nombre}, con NIF ${documentData.nif}, y domicilio a efectos de notificaciones en [DIRECCIÓN], comparece y como mejor proceda en Derecho, EXPONE:</p>
                    <p class="text-gray-800 mb-4">PRIMERO.- Que con fecha ${documentData.fechaNotificacion} me ha sido notificada Propuesta de Liquidación con número de referencia ${documentData.expediente}, correspondiente al Impuesto sobre la Renta de las Personas Físicas, ejercicio 2021.</p>
                    <p class="text-gray-800 mb-4">SEGUNDO.- Que dentro del plazo legalmente establecido, formulo las siguientes ALEGACIONES:</p>
                    ${this._generateErrorParagraphs(errors)}
                    <p class="text-gray-800 mb-4">Por lo expuesto,</p>
                    <p class="text-gray-800 mb-4">SOLICITO: Que tenga por presentado este escrito, junto con los documentos que se acompañan, se sirva admitirlo, y en su virtud, acuerde anular la propuesta de liquidación de referencia por los defectos formales y errores de cálculo detallados.</p>
                    <div class="mt-8">
                        <p class="text-gray-800">En _______________, a ____ de abril de 2023.</p>
                        <p class="text-gray-800 mt-6">Fdo.: ${documentData.nombre}</p>
                    </div>
                `;
                
                resolve(documentContent);
            }, 1200);
        });
    },
    
    // Genera un documento de recurso de reposición
    generateAppealDocument: function(documentData, errors, strategy) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const documentContent = `
                    <div class="text-right mb-4">
                        <p class="text-gray-800">${documentData.organoEmisor.toUpperCase()}</p>
                        <p class="text-gray-800">AGENCIA TRIBUTARIA</p>
                        <p class="text-gray-800">C/ Guzmán el Bueno, 139</p>
                        <p class="text-gray-800">28003 Madrid</p>
                    </div>
                    <div class="text-center mb-6">
                        <p class="text-gray-800 font-bold">RECURSO DE REPOSICIÓN</p>
                    </div>
                    <p class="text-gray-800 mb-4">D/Dña ${documentData.nombre}, con NIF ${documentData.nif}, y domicilio a efectos de notificaciones en [DIRECCIÓN], comparece y como mejor proceda en Derecho, EXPONE:</p>
                    <p class="text-gray-800 mb-4">PRIMERO.- Que con fecha ${documentData.fechaNotificacion} me ha sido notificada Liquidación con número de referencia ${documentData.expediente}, correspondiente al Impuesto sobre la Renta de las Personas Físicas, ejercicio 2021.</p>
                    <p class="text-gray-800 mb-4">SEGUNDO.- Que no estando conforme con dicha liquidación, dentro del plazo legalmente establecido, interpongo RECURSO DE REPOSICIÓN en base a los siguientes MOTIVOS:</p>
                    ${this._generateErrorParagraphs(errors)}
                    <p class="text-gray-800 mb-4">Por lo expuesto,</p>
                    <p class="text-gray-800 mb-4">SOLICITO: Que tenga por presentado este recurso de reposición contra la liquidación de referencia, se sirva admitirlo, y en su virtud, acuerde anular la liquidación recurrida por los motivos expuestos.</p>
                    <div class="mt-8">
                        <p class="text-gray-800">En _______________, a ____ de abril de 2023.</p>
                        <p class="text-gray-800 mt-6">Fdo.: ${documentData.nombre}</p>
                    </div>
                `;
                
                resolve(documentContent);
            }, 1200);
        });
    },
    
    // Genera un documento de solicitud de aplazamiento/fraccionamiento
    generatePaymentDeferralDocument: function(documentData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const documentContent = `
                    <div class="text-right mb-4">
                        <p class="text-gray-800">${documentData.organoEmisor.toUpperCase()}</p>
                        <p class="text-gray-800">AGENCIA TRIBUTARIA</p>
                        <p class="text-gray-800">C/ Guzmán el Bueno, 139</p>
                        <p class="text-gray-800">28003 Madrid</p>
                    </div>
                    <div class="text-center mb-6">
                        <p class="text-gray-800 font-bold">SOLICITUD DE APLAZAMIENTO/FRACCIONAMIENTO</p>
                    </div>
                    <p class="text-gray-800 mb-4">D/Dña ${documentData.nombre}, con NIF ${documentData.nif}, y domicilio a efectos de notificaciones en [DIRECCIÓN], comparece y como mejor proceda en Derecho, EXPONE:</p>
                    <p class="text-gray-800 mb-4">PRIMERO.- Que con fecha ${documentData.fechaNotificacion} me ha sido notificada Liquidación con número de referencia ${documentData.expediente}, por importe de ${documentData.importe}, correspondiente al Impuesto sobre la Renta de las Personas Físicas, ejercicio 2021.</p>
                    <p class="text-gray-800 mb-4">SEGUNDO.- Que debido a dificultades económico-financieras de carácter transitorio, me resulta imposible hacer frente al pago de dicha deuda en el plazo establecido.</p>
                    <p class="text-gray-800 mb-4">Por lo expuesto,</p>
                    <p class="text-gray-800 mb-4">SOLICITO: Que tenga por presentada esta solicitud y, en su virtud, acuerde concederme un aplazamiento/fraccionamiento del pago de la deuda por un periodo de [NÚMERO] meses, con vencimientos mensuales de [IMPORTE] euros.</p>
                    <div class="mt-8">
                        <p class="text-gray-800">En _______________, a ____ de abril de 2023.</p>
                        <p class="text-gray-800 mt-6">Fdo.: ${documentData.nombre}</p>
                    </div>
                `;
                
                resolve(documentContent);
            }, 1200);
        });
    },
    
    // Genera un documento de reclamación económico-administrativa
    generateEconomicAdministrativeClaimDocument: function(documentData, errors, strategy) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const documentContent = `
                    <div class="text-right mb-4">
                        <p class="text-gray-800">TRIBUNAL ECONÓMICO-ADMINISTRATIVO REGIONAL DE MADRID</p>
                        <p class="text-gray-800">C/ Orense, 25</p>
                        <p class="text-gray-800">28020 Madrid</p>
                    </div>
                    <div class="text-center mb-6">
                        <p class="text-gray-800 font-bold">RECLAMACIÓN ECONÓMICO-ADMINISTRATIVA</p>
                    </div>
                    <p class="text-gray-800 mb-4">D/Dña ${documentData.nombre}, con NIF ${documentData.nif}, y domicilio a efectos de notificaciones en [DIRECCIÓN], comparece y como mejor proceda en Derecho, EXPONE:</p>
                    <p class="text-gray-800 mb-4">PRIMERO.- Que con fecha ${documentData.fechaNotificacion} me ha sido notificada Resolución del recurso de reposición interpuesto contra la liquidación con número de referencia ${documentData.expediente}, correspondiente al Impuesto sobre la Renta de las Personas Físicas, ejercicio 2021.</p>
                    <p class="text-gray-800 mb-4">SEGUNDO.- Que no estando conforme con dicha resolución, dentro del plazo legalmente establecido, interpongo RECLAMACIÓN ECONÓMICO-ADMINISTRATIVA en base a los siguientes MOTIVOS:</p>
                    ${this._generateErrorParagraphs(errors)}
                    <p class="text-gray-800 mb-4">Por lo expuesto,</p>
                    <p class="text-gray-800 mb-4">SOLICITO: Que tenga por presentada esta reclamación económico-administrativa contra la resolución de referencia, se sirva admitirla, y en su virtud, acuerde anular la liquidación recurrida por los motivos expuestos.</p>
                    <div class="mt-8">
                        <p class="text-gray-800">En _______________, a ____ de abril de 2023.</p>
                        <p class="text-gray-800 mt-6">Fdo.: ${documentData.nombre}</p>
                    </div>
                `;
                
                resolve(documentContent);
            }, 1200);
        });
    },
    
    // Método auxiliar para generar párrafos de errores
    _generateErrorParagraphs: function(errors) {
        let paragraphs = '';
        
        errors.forEach((error, index) => {
            paragraphs += `
                <p class="text-gray-800 mb-2 font-bold">${this._getRomanNumeral(index + 1)}. ${this._getErrorTitle(error.type)}</p>
                <p class="text-gray-800 mb-4">${error.description}, contraviniendo lo dispuesto en el ${error.legalReference}.</p>
            `;
        });
        
        return paragraphs;
    },
    
    // Método auxiliar para obtener numerales romanos
    _getRomanNumeral: function(num) {
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        return romanNumerals[num - 1] || num.toString();
    },
    
    // Método auxiliar para obtener títulos de errores
    _getErrorTitle: function(errorType) {
        switch (errorType) {
            case 'procedimental':
                return 'Defecto formal en el procedimiento';
            case 'cálculo':
                return 'Error en el cálculo de intereses de demora';
            case 'formal':
                return 'Deficiencia formal en la notificación';
            default:
                return 'Error en el documento';
        }
    },
    
    // Exporta el documento a formato Word (simulado)
    exportToWord: function(documentContent) {
        return new Promise((resolve) => {
            // En una implementación real, se utilizaría una biblioteca como docx.js
            // para generar un documento Word real
            setTimeout(() => {
                // Simulamos la generación del documento
                resolve({
                    success: true,
                    message: 'Documento generado correctamente',
                    fileName: 'Alegaciones_' + new Date().toISOString().slice(0, 10) + '.docx'
                });
            }, 1000);
        });
    },
    
    // Exporta el documento a formato PDF (simulado)
    exportToPDF: function(documentContent) {
        return new Promise((resolve) => {
            // En una implementación real, se utilizaría una biblioteca como jsPDF
            // para generar un documento PDF real
            setTimeout(() => {
                // Simulamos la generación del documento
                resolve({
                    success: true,
                    message: 'Documento generado correctamente',
                    fileName: 'Alegaciones_' + new Date().toISOString().slice(0, 10) + '.pdf'
                });
            }, 1000);
        });
    }
};

// Exportar el módulo
window.DocumentGenerator = DocumentGenerator;
