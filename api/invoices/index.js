const mongoose = require('mongoose');
const Invoice = require('../../models/invoice');
const { generatePDF } = require('../../utils/pdfGenerator');
const { exportToExcel } = require('../../utils/excelExporter');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

const router = express.Router();

// Routes
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices); // Return invoices as JSON in serverless environment
  } catch (error) {
    res.status(500).send('Error fetching invoices');
  }
});

router.post('/', async (req, res) => {
  const { client, serviceType, distance, familyCar, hearse, items } = req.body;

  const formattedItems = items.map(item => ({
    name: item.name,
    description: item.description,
    quantity: parseInt(item.quantity),
    price: parseFloat(item.price),
  }));

  const totalAmount = calculateTotal({ distance: parseInt(distance), familyCar, hearse }, formattedItems);

  const newInvoice = new Invoice({
    invoiceNumber: generateInvoiceNumber(),
    client,
    serviceType,
    burial: { distance, familyCar, hearse },
    items: formattedItems,
    totalAmount,
  });

  try {
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).send('Error creating invoice');
  }
});

router.get('/:id', async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).send('Invoice not found');
  res.json(invoice);
});

router.put('/:id', async (req, res) => {
  await Invoice.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.status(200).send('Invoice status updated');
});

router.get('/:id/export/pdf', generatePDF);
router.get('/:id/export/excel', exportToExcel);

// Helper Functions
function generateInvoiceNumber() {
  return `INV-${Date.now()}`;
}

function calculateTotal(burial, items) {
  let total = 0;

  if (burial.familyCar) total += 50;
  if (burial.hearse) total += 70;
  if (burial.distance > 50) {
    total += (burial.distance - 50) * 2;
  }

  items.forEach(item => {
    total += item.price * item.quantity;
  });

  return total;
}

// Export the handler for Vercel to handle serverless functions
module.exports = (req, res) => {
  app(req, res);
};
