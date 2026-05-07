import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
}

interface ExportOptions {
  title?: string;
  includeTimestamps?: boolean;
  includeStats?: boolean;
}

export async function exportChatToPDF(
  messages: ChatMessage[],
  options: ExportOptions = {}
): Promise<Buffer> {
  const {
    title = "Histórico de Chat - Agente Financeiro Lume",
    includeTimestamps = true,
    includeStats = true,
  } = options;

  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([595, 842]); // A4 size
  let yPosition = 750;
  const lineHeight = 15;
  const margin = 40;
  const maxWidth = 515;

  // Helper function to add text with wrapping
  const addText = (
    text: string,
    size: number = 11,
    bold: boolean = false,
    color = rgb(0, 0, 0) // black
  ) => {
    if (yPosition < 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = 750;
    }

    const font = bold ? helveticaBoldFont : helveticaFont;
    page.drawText(text, {
      x: margin,
      y: yPosition,
      size,
      font,
      color,
      maxWidth,
    });

    yPosition -= lineHeight;
  };

  // Header
  addText(title, 18, true, rgb(0.12, 0.16, 0.22)); // #1f2937
  addText(
    `Exportado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR,
    })}`,
    10,
    false,
    rgb(0.42, 0.45, 0.50) // #6b7280
  );

  yPosition -= 10;

  // Stats
  if (includeStats) {
    const userMessages = messages.filter((m) => m.role === "user");
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const avgResponseLength =
      assistantMessages.length > 0
        ? Math.round(
            assistantMessages.reduce((sum, m) => sum + m.content.length, 0) /
              assistantMessages.length
          )
        : 0;

    addText("Estatísticas", 12, true, rgb(0.23, 0.51, 0.96)); // #3b82f6
    addText(`Total de Mensagens: ${messages.length}`, 10);
    addText(`Perguntas do Usuário: ${userMessages.length}`, 10);
    addText(`Respostas do Assistente: ${assistantMessages.length}`, 10);
    addText(
      `Comprimento Médio da Resposta: ${avgResponseLength} caracteres`,
      10
    );

    yPosition -= 10;
  }

  // Messages
  addText("Histórico de Conversas", 12, true, rgb(0.23, 0.51, 0.96)); // #3b82f6
  yPosition -= 5;

  messages.forEach((message) => {
    if (yPosition < 100) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = 750;
    }

    const role = message.role === "user" ? "Você" : "Assistente";
    const roleColor =
      message.role === "user" ? rgb(0.23, 0.51, 0.96) : rgb(0.06, 0.73, 0.51); // #3b82f6 : #10b981

    addText(role, 10, true, roleColor);

    // Wrap long messages
    const words = message.content.split(" ");
    let line = "";
    for (const word of words) {
      if ((line + word).length > 80) {
        addText(line, 10);
        line = word + " ";
      } else {
        line += word + " ";
      }
    }
    if (line) {
      addText(line, 10);
    }

    if (includeTimestamps) {
      addText(
        `${format(new Date(message.createdAt), "HH:mm:ss", { locale: ptBR })}`,
        8,
        false,
        rgb(0.61, 0.64, 0.69) // #9ca3af
      );
    }

    yPosition -= 5;
  });

  // Footer
  yPosition = 30;
  addText(
    "Lume - Agente Financeiro IA | Documento confidencial do usuário",
    8,
    false,
    rgb(0.61, 0.64, 0.69) // #9ca3af
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
