<?php

// Database credentials 
$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'color_crush';

// Create a connection to the remote database using MySQLi
$mysqli = new mysqli($host, $user, $password, $dbname);

// Check for database connection errors
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve the data sent by the webhook
    $status = $_POST['status'];
    $order_id = $_POST['order_id'];

    // Check if the status is "SUCCESS"
    if ($status === 'SUCCESS') {
        // First, check if the order ID is already marked as success
        $check_status_sql = "SELECT status FROM recharge WHERE id_order = ?";
        $stmt = $mysqli->prepare($check_status_sql);
        $stmt->bind_param("s", $order_id);
        $stmt->execute();
        $stmt->bind_result($current_status);
        $stmt->fetch();
        $stmt->close();

        // If the current status is already success, stop further processing
        if ($current_status == 1) {
            http_response_code(200); // OK
            echo "Order ID: " . $order_id . " already processed successfully.";
            exit;
        }

        // Update the 'recharge' table to mark the order as successful
        $update_recharge_sql = "UPDATE recharge SET status = 1 WHERE id_order = ?";
        $stmt = $mysqli->prepare($update_recharge_sql);
        $stmt->bind_param("s", $order_id);
        $stmt->execute();
        $stmt->close();

        // Extract phone number and money from the 'recharge' table
        $phone_sql = "SELECT phone, money FROM recharge WHERE id_order = ?";
        $stmt = $mysqli->prepare($phone_sql);
        $stmt->bind_param("s", $order_id);
        $stmt->execute();
        $stmt->bind_result($phone, $money_added);
        $stmt->fetch();
        $stmt->close();

        if ($phone && $money_added) {
            // Update the 'users' table
            $update_users_sql = "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?";
            $stmt = $mysqli->prepare($update_users_sql);
            $stmt->bind_param("dds", $money_added, $money_added, $phone);
            $stmt->execute();
            $stmt->close();

            // Respond to the webhook with a success message
            echo "Webhook received successfully";
        } else {
            http_response_code(400); // Bad Request
            echo "Phone number or money not found for order ID: " . $order_id;
        }
    } else {
        // Respond with an error message if the status is not "SUCCESS"
        http_response_code(400); // Bad Request
        echo "Invalid status: " . $status;
    }

    // You may want to add additional error handling and security measures here
} else {
    http_response_code(400); // Bad Request
    echo "Invalid request method";
}

// Close the database connection
$mysqli->close();

?>
