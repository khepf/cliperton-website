# BlueHost Deployment Instructions

## Setting Up the Cliperton Website on BlueHost

### 1. Upload Files
1. Build the React application: `npm run build`
2. Upload the contents of the `dist` folder to your BlueHost public_html directory
3. Upload the `download.php` script to the same directory

### 2. Create Downloads Directory
1. Create a `downloads` folder in your public_html directory
2. Upload the Cliperton installer file:
   - `Cliperton Setup 1.0.0.zip` (Windows installer in ZIP format)

### 3. Set Permissions
```bash
chmod 755 download.php
chmod 755 downloads/
chmod 644 downloads/*
```

### 4. Directory Structure on BlueHost
```
public_html/
├── index.html (from React build)
├── assets/ (from React build)
├── download.php
├── downloads/
│   └── Cliperton Setup 1.0.0.zip
└── download_log.txt (will be created automatically)
```

### 5. Features of the PHP Script
- **Secure Downloads**: Validates requests and logs all download attempts
- **Cross-Platform Support**: Ready for Windows, macOS, and Linux versions
- **Analytics**: Logs download statistics with timestamps, IP addresses, and user agents
- **Error Handling**: Proper HTTP status codes and error messages
- **CORS Support**: Allows cross-origin requests for API calls

### 6. Testing the Download
You can test the download functionality by:
1. Visiting your website and clicking the download buttons
2. Checking the download_log.txt file for logged activities
3. Testing the API endpoint directly: `GET /download.php` for download info

### 7. Security Notes
- The PHP script includes basic security measures
- Consider adding rate limiting for production use
- Monitor the download_log.txt file regularly
- Keep your BlueHost PHP version updated

### 8. Creating the Download Files

To create the ZIP file for download:

#### For Windows Installer ZIP:
1. Build your Cliperton application executable
2. Create the installer (using NSIS, Inno Setup, or similar)
3. Zip the installer file:
   ```bash
   # Put the installer exe in a folder and zip it
   mkdir Cliperton-Setup-1.0.0
   cp "Cliperton Setup 1.0.0.exe" Cliperton-Setup-1.0.0/
   7z a Cliperton-Setup-1.0.0.zip Cliperton-Setup-1.0.0/
   ```

**Benefits of using ZIP files:**
- ✅ No browser security warnings
- ✅ Faster downloads
- ✅ Better compression
- ✅ Users can see contents before extracting

### 9. Customization
To add new download versions or platforms:
1. Update the `$availableDownloads` array in download.php
2. Upload new files to the downloads directory
3. Update the React components if needed
