const PDFDocument = require('pdfkit');
const Invoice = require('../models/invoice');

exports.generatePDF = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'center' });
  doc.text(`Client: ${invoice.client}`);
  doc.text(`Service Type: ${invoice.serviceType}`);
  doc.text(`Total Amount: $${invoice.totalAmount}`);
  doc.text(`Status: ${invoice.status}`);

  doc.end();
  doc.pipe(res);
};
