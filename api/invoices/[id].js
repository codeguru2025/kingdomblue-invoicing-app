const express = require('express');
const mongoose = require('mongoose');
const Invoice = require('../../models/invoice');
const { generatePDF } = require('../../utils/pdfGenerator');
const { exportToExcel } = require('../../utils/excelExporter');

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Routes for Handling Invoice by ID
app.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send('Invoice not found');
    res.json(invoice); // Return the invoice in JSON format
  } catch (error) {
    res.status(500).send('Error fetching invoice');
  }
});

app.put('/:id', async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status }, // Assuming you're updating the status
      { new: true }
    );
    if (!updatedInvoice) return res.status(404).send('Invoice not found');
    res.json(updatedInvoice); // Return the updated invoice in JSON format
  } catch (error) {
    res.status(500).send('Error updating invoice');
  }
});

app.get('/:id/export/pdf', generatePDF);
app.get('/:id/export/excel', exportToExcel);

// Export the handler for Vercel to handle serverless functions
module.exports = (req, res) => {
  app(req, res);
};
