const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const path = require('path');
const Invoice = require('../../models/invoice');
const { generatePDF } = require('../../utils/pdfGenerator');
const { exportToExcel } = require('../../utils/excelExporter');

dotenv.config();
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Routes
app.get('/', async (req, res) => {
  const invoices = await Invoice.find();
  res.render('index', { invoices });
});

app.get('/new', (req, res) => res.render('invoiceForm'));

app.post('/', async (req, res) => {
  const { client, serviceType, distance, familyCar, hearse, items } = req.body;

  const formattedItems = items.map(item => ({
    name: item.name,
    description: item.description,
    quantity: parseInt(item.quantity),
    price: parseFloat(item.price),
  }));

  const totalAmount = calculateTotal(
    { distance: parseInt(distance), familyCar, hearse },
    formattedItems
  );

  const newInvoice = new Invoice({
    invoiceNumber: generateInvoiceNumber(),
    client,
    serviceType,
    burial: { distance, familyCar, hearse },
    items: formattedItems,
    totalAmount,
  });

  await newInvoice.save();
  res.redirect('/');
});

app.get('/:id', async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  res.render('invoiceDetails', { invoice });
});

app.put('/:id', async (req, res) => {
  await Invoice.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.redirect(`/${req.params.id}`);
});

app.get('/:id/export/pdf', generatePDF);
app.get('/:id/export/excel', exportToExcel);

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

module.exports = app;
