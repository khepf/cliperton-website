<?php
/**
 * Cliperton Pro - Stripe Webhook Handler
 * 
 * This script handles Stripe webhooks for successful payments and generates license keys.
 */

// Enable error logging
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/webhook_errors.log');

// Set headers
header('Content-Type: application/json');

try {
    // Load Stripe PHP library
    require_once __DIR__ . '/vendor/stripe-php/init.php';
    
    // Get environment variables
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
    file_put_contents(__DIR__ . '/webhook_env_debug.txt', json_encode($debugInfo) . "\n", FILE_APPEND | LOCK_EX);
    
    if (!$stripeSecretKey) {
        http_response_code(500);
        echo json_encode(['error' => 'STRIPE_SECRET_KEY environment variable not found']);
        exit();
    }
    
    if (!$webhookSecret) {
        http_response_code(500);
        echo json_encode(['error' => 'STRIPE_WEBHOOK_SECRET environment variable not found']);
        exit();
    }
    
    \Stripe\Stripe::setApiKey($stripeSecretKey);
    
    // Get the webhook payload
    $payload = @file_get_contents('php://input');
    $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
    
    // Verify webhook signature
    try {
        $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
    } catch (\UnexpectedValueException $e) {
        // Invalid payload
        http_response_code(400);
        echo json_encode(['error' => 'Invalid payload']);
        exit();
    } catch (\Stripe\Exception\SignatureVerificationException $e) {
        // Invalid signature
        http_response_code(400);
        echo json_encode(['error' => 'Invalid signature']);
        exit();
    }
    
    // Handle the event
    switch ($event['type']) {
        case 'checkout.session.completed':
            $session = $event['data']['object'];
            
            // Verify this is for our product
            if ($session['metadata']['product_type'] === 'cliperton_pro_license') {
                handleSuccessfulPurchase($session);
            }
            break;
            
        case 'payment_intent.succeeded':
            $paymentIntent = $event['data']['object'];
            
            // Additional verification if needed
            if ($paymentIntent['metadata']['product_type'] === 'cliperton_pro_license') {
                // Payment confirmed, license should already be generated from checkout.session.completed
                logWebhookEvent("Payment confirmed for session: " . $paymentIntent['id']);
            }
            break;
            
        default:
            // Log unhandled event types
            logWebhookEvent("Unhandled event type: " . $event['type']);
    }
    
    http_response_code(200);
    echo json_encode(['status' => 'success']);
    
} catch (Exception $e) {
    http_response_code(500);
    logWebhookEvent("Webhook error: " . $e->getMessage());
    echo json_encode(['error' => 'Webhook processing failed']);
}

/**
 * Handle successful purchase by generating and sending license key
 */
function handleSuccessfulPurchase($session) {
    try {
        $sessionId = $session['id'];
        $customerEmail = $session['customer_details']['email'];
        $customerName = $session['customer_details']['name'] ?? 'Customer';
        $amountPaid = $session['amount_total'] / 100; // Convert from cents
        $currency = strtoupper($session['currency']);
        
        // Generate license key
        $licenseKey = generateLicenseKey($customerEmail, time());
        
        // Save license to database/file
        saveLicenseRecord($licenseKey, $customerEmail, $sessionId, $amountPaid, $currency);
        
        // Send license email
        sendLicenseEmail($customerEmail, $customerName, $licenseKey, $sessionId);
        
        // Log successful processing
        logWebhookEvent("License generated successfully: $licenseKey for $customerEmail (Session: $sessionId)");
        
    } catch (Exception $e) {
        logWebhookEvent("Error processing purchase: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Generate a license key based on email and timestamp
 */
function generateLicenseKey($email, $timestamp) {
    // Use a secret salt for security
    $secretSalt = getenv('CLIPERTON_LICENSE_SALT') ?: 'cliperton_secret_salt_2025_change_this';
    
    // Create hash from email, timestamp, and secret
    $hash = hash('sha256', $email . $timestamp . $secretSalt);
    
    // Format as CLIP-XXXX-XXXX-XXXX
    $key = 'CLIP-' . 
           strtoupper(substr($hash, 0, 4)) . '-' .
           strtoupper(substr($hash, 4, 4)) . '-' .
           strtoupper(substr($hash, 8, 4));
    
    return $key;
}

/**
 * Save license record to file (in production, use a database)
 */
function saveLicenseRecord($licenseKey, $email, $sessionId, $amount, $currency) {
    $record = [
        'license_key' => $licenseKey,
        'email' => $email,
        'stripe_session_id' => $sessionId,
        'amount_paid' => $amount,
        'currency' => $currency,
        'generated_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ];
    
    // Save to JSON file (use database in production)
    $licensesFile = __DIR__ . '/licenses.json';
    
    $licenses = [];
    if (file_exists($licensesFile)) {
        $licenses = json_decode(file_get_contents($licensesFile), true) ?: [];
    }
    
    $licenses[] = $record;
    
    file_put_contents($licensesFile, json_encode($licenses, JSON_PRETTY_PRINT), LOCK_EX);
    
    // Also save individual license file for easy lookup
    $licensePath = __DIR__ . '/licenses/' . $licenseKey . '.json';
    if (!is_dir(__DIR__ . '/licenses')) {
        mkdir(__DIR__ . '/licenses', 0755, true);
    }
    
    file_put_contents($licensePath, json_encode($record, JSON_PRETTY_PRINT), LOCK_EX);
}

/**
 * Send license key via email
 */
function sendLicenseEmail($email, $name, $licenseKey, $sessionId) {
    $subject = "Your Cliperton Pro License Key";
    
    $message = "
    <html>
    <head>
        <title>Cliperton Pro License</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3498db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .license-key { background: #2c3e50; color: white; padding: 15px; font-size: 18px; font-weight: bold; text-align: center; border-radius: 5px; letter-spacing: 2px; margin: 20px 0; }
            .instructions { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎉 Welcome to Cliperton Pro!</h1>
            </div>
            <div class='content'>
                <p>Hello $name,</p>
                
                <p>Thank you for purchasing Cliperton Pro! Your license key is ready:</p>
                
                <div class='license-key'>$licenseKey</div>
                
                <div class='instructions'>
                    <h3>How to activate your license:</h3>
                    <ol>
                        <li>Download and install Cliperton (if you haven't already)</li>
                        <li>Open Cliperton</li>
                        <li>Click the 'Save Group' or 'Load Group' button</li>
                        <li>When prompted, enter your license key: <strong>$licenseKey</strong></li>
                        <li>Enjoy unlimited clipboard history and save/load features!</li>
                    </ol>
                </div>
                
                <p><strong>What you've unlocked:</strong></p>
                <ul>
                    <li>✅ Save clipboard groups to files</li>
                    <li>✅ Load saved clipboard groups</li>
                    <li>✅ Import/Export collections</li>
                    <li>✅ Unlimited clipboard history</li>
                    <li>✅ Lifetime updates</li>
                    <li>✅ Priority support</li>
                </ul>
                
                <p>Need help? Reply to this email or visit our support page.</p>
                
                <div class='footer'>
                    <p>Order ID: $sessionId</p>
                    <p>This license key is valid for one computer. Keep it safe!</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Cliperton <noreply@cliperton.tech>',
        'Reply-To: support@cliperton.tech',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Send email
    $success = mail($email, $subject, $message, implode("\r\n", $headers));
    
    if (!$success) {
        throw new Exception("Failed to send license email to $email");
    }
    
    logWebhookEvent("License email sent successfully to $email");
}

/**
 * Log webhook events
 */
function logWebhookEvent($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message\n";
    file_put_contents(__DIR__ . '/webhook_log.txt', $logEntry, FILE_APPEND | LOCK_EX);
}
?>
