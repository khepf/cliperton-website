<?php
/**
 * Cliperton Pro - License Validation API
 * 
 * This endpoint validates license keys against the stored license database.
 * Used by the Cliperton app to verify legitimate purchases.
 */

// Enable error logging
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/validation_errors.log');

// CORS headers for Electron app requests
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
    // Parse request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Get license key from request
    $licenseKey = $input['license_key'] ?? '';
    $email = $input['email'] ?? null;
    
    if (empty($licenseKey)) {
        http_response_code(400);
        echo json_encode([
            'valid' => false,
            'error' => 'License key is required'
        ]);
        exit;
    }
    
    // Validate license key format first
    if (!preg_match('/^CLIP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/', $licenseKey)) {
        echo json_encode([
            'valid' => false,
            'error' => 'Invalid license key format'
        ]);
        exit;
    }
    
    // Check if license exists in database
    $licenseInfo = findLicenseByKey($licenseKey);
    
    if (!$licenseInfo) {
        echo json_encode([
            'valid' => false,
            'error' => 'License key not found'
        ]);
        exit;
    }
    
    // Check license status
    if ($licenseInfo['status'] !== 'active') {
        echo json_encode([
            'valid' => false,
            'error' => 'License is not active',
            'status' => $licenseInfo['status']
        ]);
        exit;
    }
    
    // Optional: Validate email if provided
    if ($email && $licenseInfo['email'] !== $email) {
        echo json_encode([
            'valid' => false,
            'error' => 'Email does not match license record'
        ]);
        exit;
    }
    
    // License is valid - log the validation attempt
    logValidationAttempt($licenseKey, $licenseInfo['email'], true);
    
    // Return success response
    echo json_encode([
        'valid' => true,
        'email' => $licenseInfo['email'],
        'generated_at' => $licenseInfo['generated_at'],
        'amount_paid' => $licenseInfo['amount_paid'],
        'currency' => $licenseInfo['currency']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    error_log("License validation error: " . $e->getMessage());
    echo json_encode([
        'valid' => false,
        'error' => 'Internal server error'
    ]);
}

/**
 * Find license by key in the stored license files
 */
function findLicenseByKey($licenseKey) {
    // First try individual license file (faster)
    $licensePath = __DIR__ . '/licenses/' . $licenseKey . '.json';
    if (file_exists($licensePath)) {
        $content = file_get_contents($licensePath);
        if ($content) {
            return json_decode($content, true);
        }
    }
    
    // Fallback: search in main licenses.json file
    $licensesFile = __DIR__ . '/licenses.json';
    if (file_exists($licensesFile)) {
        $licenses = json_decode(file_get_contents($licensesFile), true) ?: [];
        
        foreach ($licenses as $license) {
            if ($license['license_key'] === $licenseKey) {
                return $license;
            }
        }
    }
    
    return null;
}

/**
 * Log validation attempts for analytics and security monitoring
 */
function logValidationAttempt($licenseKey, $email, $success) {
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    $logEntry = [
        'timestamp' => $timestamp,
        'license_key' => $licenseKey,
        'email' => $email,
        'success' => $success,
        'ip' => $ip,
        'user_agent' => $userAgent
    ];
    
    $logFile = __DIR__ . '/validation_log.json';
    
    // Load existing logs
    $logs = [];
    if (file_exists($logFile)) {
        $logs = json_decode(file_get_contents($logFile), true) ?: [];
    }
    
    // Add new log entry
    $logs[] = $logEntry;
    
    // Keep only last 1000 entries to prevent file from getting too large
    if (count($logs) > 1000) {
        $logs = array_slice($logs, -1000);
    }
    
    // Save logs
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT), LOCK_EX);
}
?>
