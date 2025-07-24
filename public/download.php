<?php
/**
 * Cliperton Download Handler
 * 
 * This PHP script handles download requests for the Cliperton application.
 * It's designed to work with BlueHost hosting and serves the installer files.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration
$downloadPath = __DIR__ . '/downloads/';
$logFile = __DIR__ . '/download_log.txt';

// Available downloads
$availableDownloads = [
    'windows' => [
        'free' => [
            'file' => 'Cliperton Setup 1.0.0.zip',
            'mime' => 'application/zip',
            'size' => filesize($downloadPath . 'Cliperton Setup 1.0.0.zip') ?: 0
        ],
        'pro' => [
            'file' => 'Cliperton Pro Setup 1.0.0.zip',
            'mime' => 'application/zip',
            'size' => filesize($downloadPath . 'Cliperton Pro Setup 1.0.0.zip') ?: 0
        ]
    ]
];

/**
 * Log download activity
 */
function logDownload($platform, $userAgent, $ip) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] Platform: $platform | IP: $ip | User-Agent: $userAgent\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

/**
 * Serve file download
 */
function serveDownload($filePath, $fileName, $mimeType) {
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
        exit;
    }

    // Set headers for file download
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    
    // Clear any output buffers
    if (ob_get_level()) {
        ob_end_clean();
    }
    
    // Read and output the file
    readfile($filePath);
    exit;
}

// Main logic
try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get POST data
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['platform'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing platform parameter']);
            exit;
        }
        
        $platform = $input['platform'];
        $version = $input['version'] ?? '1.0.0';
        $type = $input['type'] ?? 'free'; // 'free' or 'pro'
        
        // Check if platform is supported
        if (!isset($availableDownloads[$platform])) {
            http_response_code(400);
            echo json_encode(['error' => 'Unsupported platform']);
            exit;
        }
        
        // Check if download type is supported
        if (!isset($availableDownloads[$platform][$type])) {
            http_response_code(400);
            echo json_encode(['error' => 'Unsupported download type']);
            exit;
        }
        
        $download = $availableDownloads[$platform][$type];
        $filePath = $downloadPath . $download['file'];
        
        // Log the download
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
        logDownload($platform . '_' . $type, $userAgent, $ip);
        
        // Serve the file
        serveDownload($filePath, $download['file'], $download['mime']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Return available downloads info
        $downloads = [];
        foreach ($availableDownloads as $platform => $types) {
            $downloads[$platform] = [];
            foreach ($types as $type => $info) {
                $filePath = $downloadPath . $info['file'];
                $downloads[$platform][$type] = [
                    'available' => file_exists($filePath),
                    'size' => file_exists($filePath) ? filesize($filePath) : 0,
                    'file' => $info['file']
                ];
            }
        }
        
        echo json_encode([
            'status' => 'success',
            'downloads' => $downloads,
            'version' => '1.0.0'
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
