const express = require('express');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// Payment Gateway Configuration
const MERCHANT_ID = 'MLD9Q6DRVOP81749886703';
const API_KEY = 'sHlgnksLc0cpdFxURu2YC0wf3gzNJeTF';
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

    return crypto
        .createHmac('sha256', secretKey)
        .update(dataString)
        .digest('hex');
}

// Payment Gateway Routes
app.post('/payment-gateway/initiate', async (req, res) => {
    try {
        const { amount, userToken, phone } = req.body;
        const orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 100000000);

        const orderData = {
            customer_mobile: phone || '9999999999',
            merch_id: MERCHANT_ID,
            amount: amount,
            order_id: orderId,
            currency: 'INR',
            redirect_url: 'https://beastmanxxx.github.io/Color-Crush/payment-success',
            udf1: userToken || 'guest',
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
            throw new Error('Failed to initiate payment');
        }
    } catch (error) {
        console.error('Payment initiation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Payment initiation failed. Please try again.'
        });
    }
});

// Serve main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Payment success page
app.get('/payment-success', (req, res) => {
    const orderId = req.query.order;
    if (!orderId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'views', 'payment-success.html'));
});

// Payment failure page
app.get('/payment-failure', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'payment-failure.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
