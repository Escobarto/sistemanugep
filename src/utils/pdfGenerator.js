import { jsPDF } from "jspdf";

export const generateMovementReceipt = (movementData, artifactData) => {
  try {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text("Termo de Movimentação - NUGEP", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.text(`Data da Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
    doc.text(`Tipo de Movimento: ${movementData.type}`, 20, 50);
    
    // Dados da Obra
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);
    doc.setFontSize(14);
    doc.text("Dados da Obra:", 20, 70);
    doc.setFontSize(12);
    doc.text(`Título: ${artifactData.title}`, 20, 80);
    doc.text(`Nº Registro: ${artifactData.regNumber}`, 20, 90);
    doc.text(`Autor/Artista: ${artifactData.artist}`, 20, 100);

    // Detalhes do Trânsito
    doc.line(20, 110, 190, 110);
    doc.setFontSize(14);
    doc.text("Detalhes do Trânsito:", 20, 120);
    doc.setFontSize(12);
    
    // Aqui usamos o destino REAL digitado
    doc.text(`Origem: ${movementData.from || artifactData.location}`, 20, 130);
    doc.text(`Destino: ${movementData.to}`, 20, 140);
    
    if (movementData.returnDate) {
        doc.text(`Previsão de Retorno: ${new Date(movementData.returnDate).toLocaleDateString('pt-BR')}`, 20, 150);
    }
    doc.text(`Responsável: ${movementData.responsible}`, 20, 160);

    // Assinatura
    doc.text("_______________________________________________", 20, 230);
    doc.text("Assinatura do Responsável (Recebimento)", 20, 240);

    doc.save(`Recibo_Movimentacao_${artifactData.regNumber}.pdf`);
    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Erro ao gerar PDF. Verifique se a biblioteca 'jspdf' está instalada no package.json.");
    return false;
  }
};
