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

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Payment Gateway Routes
app.post('/payment-gateway/pay.php', (req, res) => {
    res.redirect('/payment-gateway/pay.php');
});

app.post('/payment-gateway/callback.php', (req, res) => {
    res.redirect('/payment-gateway/callback.php');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 
