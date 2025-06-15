<?php

$amount = $_POST['am'];
$user_token = $_POST['user'];

// Database credentials 
$host = 'localhost';
$db_user = 'root';
$db_password = '';
$dbname = 'color_crush';

// Create a connection to the remote database using MySQLi
$mysqli = new mysqli($host, $db_user, $db_password, $dbname);

// Check for database connection errors
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Retrieve the phone number from the database
$sql = "SELECT phone FROM users WHERE token = ?";
$stmt = $mysqli->prepare($sql);
$stmt->bind_param("s", $user_token);
$stmt->execute();
$stmt->bind_result($phone);
$stmt->fetch();
$stmt->close();

if (empty($phone)) {
    die("Error: User not found or phone number missing.");
}

// API endpoint URL
$url = 'https://fastzix.in/api/v1/order';

// Data to be sent in the POST request
$data = [
    'customer_mobile' => $phone,
    'merch_id' => 'MLD9Q6DRVOP81749886703',
    'amount' => $amount,
    'order_id' => 'ORD' . round(microtime(true) * 1000) . rand(11111111, 99999999),
    'currency' => 'INR',
    'redirect_url' => 'https://beastmanxxx.github.io/Color-Crush/payment-gateway/callback.php',
    'udf1' => 'CustomData1',
    'udf2' => 'CustomData2',
    'udf3' => 'CustomData3',
    'udf4' => 'CustomData4',
    'udf5' => 'CustomData5',
];

$datatosend = json_encode($data);

// Generate xverify
function generatexverify($data, $secret_key) {
    ksort($data);
    $dataString = implode('|', array_map(function ($key, $value) {
        return $key . '=' . $value;
    }, array_keys($data), $data));
    return hash_hmac('sha256', $dataString, $secret_key);
}

$secret_key = 'm4Eu0PjMm1j0j3swoJSSuZmux0kluUTJ';
$xverify = generatexverify($data, $secret_key);

// Headers for the request
$headers = [
    'Content-Type: application/json',
    'X-VERIFY: ' . $xverify,
];

// Initialize cURL session
$ch = curl_init($url);

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $datatosend);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

// Execute the cURL session
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo curl_error($ch);
} else {
    $responseData = json_decode($response, true);
    
    if ($responseData['status'] && isset($responseData['result']['payment_url'])) {
        $orderId = $responseData['result']['orderId'];
        $transactionId = $orderId; // Use orderId as transactionId
        $utr = 1; 
        $status = 0; 
        $today = date('Y-m-d'); 
        $paymentUrl = $responseData['result']['payment_url']; 
        $time = round(microtime(true) * 1000); // JavaScript-like timestamp

        $sql = "INSERT INTO recharge (id_order, transaction_id, utr, phone, money, type, status, today, url, time) 
                VALUES ('$orderId', '$transactionId', $utr, '$phone', $amount, 'bank', $status, '$today', '$paymentUrl', $time)";
        
        if ($mysqli->query($sql) === TRUE) {
            header("Location: " . $paymentUrl);
            exit();
        } else {
            echo "Error: " . $sql . "<br>" . $mysqli->error;
        }
    } else {
        echo "Error: Payment URL not found!";
    }
}

// Close cURL session
curl_close($ch);

// Close database connection
$mysqli->close();

?>
