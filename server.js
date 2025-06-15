const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5555;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Payment Gateway Routes
const paymentRoutes = require('./payment-gateway/payment');
app.use('/payment-gateway', paymentRoutes);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Payment Success Page
app.get('/payment-success', (req, res) => {
    const orderId = req.query.order;
    if (!orderId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'views/payment-success.html'));
});

// Payment Failed Page
app.get('/payment-failed', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/payment-failed.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 