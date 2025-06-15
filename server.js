const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5555;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Payment Gateway Configuration
const MERCHANT_ID = 'MLD9Q6DRVOP81749886703';
const API_KEY = 'm4Eu0PjMm1j0j3swoJSSuZmux0kluUTJ';
const API_URL = 'https://fastzix.in/api/v1/order';

// Generate xverify signature
function generateXVerify(data, secretKey) {
    const sortedData = Object.keys(data)
        .sort()
        .reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
        }, {});

    const dataString = Object.entries(sortedData)
        .map(([key, value]) => `${key}=${value}`)
        .join('|');

    return require('crypto')
        .createHmac('sha256', secretKey)
        .update(dataString)
        .digest('hex');
}

// Payment Gateway Routes
app.post('/payment-gateway/initiate', async (req, res) => {
    try {
        const { amount, userToken, phone } = req.body;

        const orderData = {
            customer_mobile: phone || '9999999999', // Fallback phone number
            merch_id: MERCHANT_ID,
            amount: amount,
            order_id: 'ORD' + Date.now() + Math.floor(Math.random() * 100000000),
            currency: 'INR',
            redirect_url: 'https://beastmanxxx.github.io/Color-Crush/payment-success',
            udf1: 'CustomData1',
            udf2: 'CustomData2',
            udf3: 'CustomData3',
            udf4: 'CustomData4',
            udf5: 'CustomData5'
        };

        const xverify = generateXVerify(orderData, API_KEY);

        const response = await axios.post(API_URL, orderData, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': xverify
            }
        });

        if (response.data.status && response.data.result.payment_url) {
            res.json({
                success: true,
                paymentUrl: response.data.result.payment_url,
                orderId: response.data.result.orderId
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to initiate payment'
            });
        }
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

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
