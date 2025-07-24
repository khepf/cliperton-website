<?php
/**
 * Get License Key by Stripe Session ID
 * 
 * This endpoint allows the success page to display the license key
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $sessionId = $_GET['session_id'] ?? '';
    
    if (empty($sessionId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing session_id parameter']);
        exit;
    }
    
    // Load licenses from file (use database in production)
    $licensesFile = __DIR__ . '/licenses.json';
    
    if (!file_exists($licensesFile)) {
        http_response_code(404);
        echo json_encode(['error' => 'License not found']);
        exit;
    }
    
    $licenses = json_decode(file_get_contents($licensesFile), true) ?: [];
    
    // Find license by session ID
    $foundLicense = null;
    foreach ($licenses as $license) {
        if ($license['stripe_session_id'] === $sessionId) {
            $foundLicense = $license;
            break;
        }
    }
    
    if (!$foundLicense) {
        // License might not be generated yet (webhook delay)
        echo json_encode([
            'status' => 'pending',
            'message' => 'License is being generated. Please check your email or refresh in a moment.'
        ]);
        exit;
    }
    
    // Return license information (excluding sensitive data)
    echo json_encode([
        'status' => 'found',
        'license_key' => $foundLicense['license_key'],
        'email' => $foundLicense['email'],
        'generated_at' => $foundLicense['generated_at']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>
