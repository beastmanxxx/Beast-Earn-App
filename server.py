from flask import Flask, request, jsonify
from flask_cors import CORS
import qrcode
import io
import base64
import time
import json
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Store active QR codes and their expiry times
active_qr_codes = {}

@app.route('/generate-qr', methods=['POST'])
def generate_qr():
    try:
        data = request.json
        amount = float(data.get('amount'))
        upi_id = "8979873681@mbk"
        
        # Create UPI payment URL
        upi_url = f"upi://pay?pa={upi_id}&pn=BeastEarn&am={amount}&cu=INR&tn=Deposit for BeastEarn"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(upi_url)
        qr.make(fit=True)
        
        # Create QR code image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert image to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Generate unique transaction ID
        transaction_id = f"BEAST_{int(time.time())}"
        
        # Store QR code info with 3-minute expiry
        expiry_time = datetime.now() + timedelta(minutes=3)
        active_qr_codes[transaction_id] = {
            'amount': amount,
            'expiry': expiry_time,
            'verified': False
        }
        
        return jsonify({
            'success': True,
            'qr_code': img_str,
            'transaction_id': transaction_id,
            'expiry_time': expiry_time.isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/verify-payment', methods=['POST'])
def verify_payment():
    try:
        data = request.json
        transaction_id = data.get('transaction_id')
        utr_number = data.get('utr_number')
        
        if not transaction_id or not utr_number:
            return jsonify({
                'success': False,
                'error': 'Missing transaction ID or UTR number'
            }), 400
            
        # Check if transaction exists and is not expired
        if transaction_id not in active_qr_codes:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired transaction'
            }), 400
            
        transaction = active_qr_codes[transaction_id]
        
        if datetime.now() > transaction['expiry']:
            return jsonify({
                'success': False,
                'error': 'Transaction expired'
            }), 400
            
        if transaction['verified']:
            return jsonify({
                'success': False,
                'error': 'Transaction already verified'
            }), 400
            
        # Here you would typically verify the UTR with your payment gateway
        # For now, we'll simulate successful verification
        transaction['verified'] = True
        
        return jsonify({
            'success': True,
            'amount': transaction['amount'],
            'message': 'Payment verified successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 