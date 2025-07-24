<?php
/**
 * Cliperton Pro - Stripe Checkout Session Creator
 * 
 * This script creates a Stripe checkout session for purchasing Cliperton Pro license.
 * Environment variables should be set on your hosting server for security.
 */

// Enable error reporting for development (disable in production)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// CORS headers for frontend requests
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Load Stripe PHP library (you'll need to install this via Composer)
    // For BlueHost or shared hosting, upload the stripe-php library to your server
    // Download from: https://github.com/stripe/stripe-php
    require_once __DIR__ . '/vendor/stripe-php/init.php';
    
    // Get Stripe secret key from environment variable
    // Set this in your hosting control panel or .htaccess file
    $stripeSecretKey = getenv('STRIPE_SECRET_KEY');
    $webhookSecret = getenv('STRIPE_WEBHOOK_SECRET');
    
    // Debug logging - check what environment variables we're getting
    $debugInfo = [
        'timestamp' => date('Y-m-d H:i:s'),
        'stripe_key_found' => $stripeSecretKey ? 'YES' : 'NO',
        'stripe_key_prefix' => $stripeSecretKey ? substr($stripeSecretKey, 0, 8) . '...' : 'NULL',
        'webhook_secret_found' => $webhookSecret ? 'YES' : 'NO',
        'webhook_secret_prefix' => $webhookSecret ? substr($webhookSecret, 0, 8) . '...' : 'NULL'
    ];
    file_put_contents(__DIR__ . '/env_debug.txt', json_encode($debugInfo) . "\n", FILE_APPEND | LOCK_EX);
    
    if (!$stripeSecretKey) {
        throw new Exception('STRIPE_SECRET_KEY environment variable not found or empty');
    }
    
    if (!$webhookSecret) {
        throw new Exception('STRIPE_WEBHOOK_SECRET environment variable not found or empty');
    }
    
    \Stripe\Stripe::setApiKey($stripeSecretKey);
    
    // Parse request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate required fields
    $requiredFields = ['product', 'price', 'currency', 'productName', 'successUrl', 'cancelUrl'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Extract data
    $product = $input['product'];
    $price = (int)$input['price']; // Price in cents
    $currency = $input['currency'];
    $productName = $input['productName'];
    $successUrl = $input['successUrl'];
    $cancelUrl = $input['cancelUrl'];
    
    // Log the URLs being used for debugging
    $debugLog = date('Y-m-d H:i:s') . " - Creating session with URLs: success=" . $successUrl . ", cancel=" . $cancelUrl . "\n";
    file_put_contents(__DIR__ . '/url_debug.txt', $debugLog, FILE_APPEND | LOCK_EX);
    
    // Use the URLs as provided (they already include session_id placeholder if needed)
    
    // Create checkout session
    $checkoutSession = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency' => $currency,
                'product_data' => [
                    'name' => $productName,
                    'description' => 'Unlock save/load features for Cliperton clipboard manager',
                    'images' => [], // Add product images if you have them
                ],
                'unit_amount' => $price,
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => $successUrl,
        'cancel_url' => $cancelUrl,
        'customer_creation' => 'always',
        'payment_intent_data' => [
            'metadata' => [
                'product_type' => 'cliperton_pro_license',
                'version' => '1.0.0',
            ],
        ],
        'metadata' => [
            'product_type' => 'cliperton_pro_license',
            'product_id' => $product,
            'version' => '1.0.0',
        ],
        // Collect customer email for license delivery
        'customer_email' => null, // Let customer enter email
        // Optional: Set expiration time (24 hours)
        'expires_at' => time() + (24 * 60 * 60),
    ]);
    
    // Log the session creation for debugging
    $logEntry = date('Y-m-d H:i:s') . " - Checkout session created: " . $checkoutSession->id . " for product: $product\n";
    file_put_contents(__DIR__ . '/checkout_log.txt', $logEntry, FILE_APPEND | LOCK_EX);
    
    // Return session ID to frontend
    echo json_encode([
        'id' => $checkoutSession->id,
        'url' => $checkoutSession->url
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    
    // Log error
    $errorLog = date('Y-m-d H:i:s') . " - Checkout error: " . $e->getMessage() . "\n";
    file_put_contents(__DIR__ . '/error_log.txt', $errorLog, FILE_APPEND | LOCK_EX);
    
    echo json_encode([
        'error' => 'Payment processing error: ' . $e->getMessage()
    ]);
}
?>
