const ExcelJS = require('exceljs');
const Invoice = require('../models/invoice');

exports.exportToExcel = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Invoice');

  sheet.addRow(['Invoice Number', invoice.invoiceNumber]);
  sheet.addRow(['Client', invoice.client]);
  sheet.addRow(['Service Type', invoice.serviceType]);
  sheet.addRow(['Total Amount', `$${invoice.totalAmount}`]);
  sheet.addRow(['Status', invoice.status]);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};
