const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  quantity: Number,
  price: Number,
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  client: String,
  serviceType: String,
  burial: {
    distance: Number,
    familyCar: Boolean,
    hearse: Boolean
  },
  items: [itemSchema],
  totalAmount: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
