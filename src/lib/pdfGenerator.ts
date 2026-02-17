import jsPDF from "jspdf";

interface PosterConfig {
  establishmentName: string;
  qrCodeDataUrl: string;
  primaryColor: string;
  secondaryColor: string;
  format: "A4" | "A5" | "sticker";
}

export const generatePoster = async (config: PosterConfig): Promise<void> => {
  const { establishmentName, qrCodeDataUrl, primaryColor, secondaryColor, format } = config;

  // Format dimensions (mm)
  const formats = {
    A4: { width: 210, height: 297 },
    A5: { width: 148, height: 210 },
    sticker: { width: 100, height: 100 }
  };

  const dim = formats[format];
  const pdf = new jsPDF({
    orientation: format === "sticker" ? "portrait" : "portrait",
    unit: "mm",
    format: format === "sticker" ? [dim.width, dim.height] : format
  });

  // Background gradient (simulate with rectangles)
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, dim.width, dim.height, "F");

  if (format === "A4") {
    // A4 Poster Layout
    generateA4Poster(pdf, dim, establishmentName, qrCodeDataUrl, primaryColor, secondaryColor);
  } else if (format === "A5") {
    // A5 Table Tent Layout
    generateA5Poster(pdf, dim, establishmentName, qrCodeDataUrl, primaryColor, secondaryColor);
  } else {
    // Sticker Layout
    generateSticker(pdf, dim, establishmentName, qrCodeDataUrl, primaryColor);
  }

  // Download PDF
  const filename = `prizmo-${format.toLowerCase()}-${establishmentName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  pdf.save(filename);
};

const generateA4Poster = (
  pdf: jsPDF,
  dim: { width: number; height: number },
  name: string,
  qrCode: string,
  primary: string,
  secondary: string
) => {
  const centerX = dim.width / 2;

  // Title section with colored background
  const titleHeight = 50;
  pdf.setFillColor(...hexToRgb(primary));
  pdf.rect(0, 0, dim.width, titleHeight, "F");

  // Main title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  pdf.text("JOUEZ ET GAGNEZ !", centerX, 25, { align: "center" });

  // Subtitle
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.text("Laissez un avis Google et tentez de gagner un cadeau", centerX, 38, { align: "center" });

  // Establishment name
  pdf.setFillColor(...hexToRgb(secondary));
  pdf.rect(0, titleHeight, dim.width, 20, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text(name, centerX, titleHeight + 13, { align: "center" });

  // QR Code section
  const qrSize = 120;
  const qrX = (dim.width - qrSize) / 2;
  const qrY = titleHeight + 40;

  // QR Code border
  pdf.setDrawColor(...hexToRgb(primary));
  pdf.setLineWidth(2);
  pdf.rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);

  // QR Code image
  pdf.addImage(qrCode, "PNG", qrX, qrY, qrSize, qrSize);

  // Instructions
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("COMMENT PARTICIPER ?", centerX, qrY + qrSize + 25, { align: "center" });

  // Steps
  const stepY = qrY + qrSize + 40;
  const stepSpacing = 15;

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  
  const steps = [
    "1️⃣ Scannez ce QR code avec votre téléphone",
    "2️⃣ Laissez un avis sur notre page Google",
    "3️⃣ Tournez la roue de la fortune",
    "4️⃣ Récupérez votre cadeau au comptoir !"
  ];

  steps.forEach((step, index) => {
    pdf.text(step, 20, stepY + (index * stepSpacing));
  });

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text("Propulsé par Prizmo", centerX, dim.height - 10, { align: "center" });
};

const generateA5Poster = (
  pdf: jsPDF,
  dim: { width: number; height: number },
  name: string,
  qrCode: string,
  primary: string,
  secondary: string
) => {
  const centerX = dim.width / 2;

  // Header
  pdf.setFillColor(...hexToRgb(primary));
  pdf.rect(0, 0, dim.width, 35, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("JOUEZ !", centerX, 15, { align: "center" });

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("Laissez un avis et gagnez", centerX, 25, { align: "center" });

  // Establishment name bar
  pdf.setFillColor(...hexToRgb(secondary));
  pdf.rect(0, 35, dim.width, 15, "F");
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(name, centerX, 44, { align: "center" });

  // QR Code
  const qrSize = 80;
  const qrX = (dim.width - qrSize) / 2;
  const qrY = 60;

  pdf.setDrawColor(...hexToRgb(primary));
  pdf.setLineWidth(1.5);
  pdf.rect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6);
  pdf.addImage(qrCode, "PNG", qrX, qrY, qrSize, qrSize);

  // Instructions
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Scannez pour participer", centerX, qrY + qrSize + 15, { align: "center" });

  // Quick steps
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const quickSteps = [
    "✓ Avis Google",
    "✓ Tournez la roue",
    "✓ Gagnez un cadeau"
  ];

  quickSteps.forEach((step, index) => {
    pdf.text(step, centerX, qrY + qrSize + 30 + (index * 8), { align: "center" });
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text("Propulsé par Prizmo", centerX, dim.height - 5, { align: "center" });
};

const generateSticker = (
  pdf: jsPDF,
  dim: { width: number; height: number },
  name: string,
  qrCode: string,
  primary: string
) => {
  const centerX = dim.width / 2;
  const centerY = dim.height / 2;

  // Circular border
  pdf.setDrawColor(...hexToRgb(primary));
  pdf.setLineWidth(2);
  pdf.circle(centerX, centerY, 45, "S");

  // QR Code
  const qrSize = 60;
  const qrX = (dim.width - qrSize) / 2;
  const qrY = 15;
  pdf.addImage(qrCode, "PNG", qrX, qrY, qrSize, qrSize);

  // Text
  pdf.setTextColor(...hexToRgb(primary));
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("SCANNEZ", centerX, qrY + qrSize + 8, { align: "center" });
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("& GAGNEZ", centerX, qrY + qrSize + 14, { align: "center" });
};

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [147, 51, 234]; // Default purple
};