export const generarEnlacesLegales = (terminoBusqueda) => {
  const encoded = encodeURIComponent(terminoBusqueda);

  return {
    boe: `https://www.boe.es/buscar/?q=${encoded}`,
    cendoj: `https://www.poderjudicial.es/search/indexAN.jsp?tipoBusqueda=CONTENIDO&contenido=${encoded}`,
    aeat: `https://sede.agenciatributaria.gob.es/Sede/consulta-vinculante.html?q=${encoded}`,
    tributos: `https://petete.minhafp.gob.es/consultas/?texto=${encoded}`
  };
};
