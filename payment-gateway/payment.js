const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

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

    return crypto
        .createHmac('sha256', secretKey)
        .update(dataString)
        .digest('hex');
}

// Handle payment initiation
router.post('/initiate', async (req, res) => {
    try {
        const { amount, userToken, phone } = req.body;

        const orderData = {
            customer_mobile: phone,
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

// Handle payment callback
router.post('/callback', async (req, res) => {
    try {
        const { status, order_id, transaction_id } = req.body;

        if (status === 'SUCCESS') {
            // Store the transaction details
            const transaction = {
                orderId: order_id,
                transactionId: transaction_id,
                status: 'SUCCESS',
                timestamp: new Date().toISOString()
            };

            // Here you would typically:
            // 1. Update your database with the transaction
            // 2. Update user's balance
            // 3. Send confirmation email/notification

            // For now, redirect to success page with transaction ID
            res.redirect(`/payment-success?order=${order_id}`);
        } else {
            // Log the failed transaction
            console.error('Payment failed:', {
                orderId: order_id,
                status: status,
                timestamp: new Date().toISOString()
            });
            res.redirect('/payment-failed');
        }
    } catch (error) {
        console.error('Payment callback error:', error);
        res.redirect('/payment-failed');
    }
});

module.exports = router; 