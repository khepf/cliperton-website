# Cliperton Freemium Setup Guide

This guide walks you through setting up the freemium version of the Cliperton website with Stripe payment processing.

## 📋 Prerequisites

- BlueHost hosting account (or similar PHP hosting)
- Stripe account
- Domain name configured
- FTP/cPanel access to your server

## 🔧 Setup Steps

### 1. Stripe Account Setup

1. **Create Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**: 
   - Go to [Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys)
   - Copy your **Publishable key** (starts with `pk_`)
   - Copy your **Secret key** (starts with `sk_`)
3. **Create Webhook Endpoint**:
   - Go to [Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/webhook.php`
   - Events to listen for: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy the **Webhook signing secret** (starts with `whsec_`)

### 2. Environment Configuration

1. **Copy Environment File**:
   ```bash
   cp .env.example .env
   ```

2. **Update .env file** with your actual values:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key_here
   VITE_SUCCESS_URL=https://yourdomain.com/success
   VITE_CANCEL_URL=https://yourdomain.com/cancel
   VITE_SITE_URL=https://yourdomain.com
   ```

### 3. Server Environment Variables

Set these in your BlueHost hosting control panel:

#### Option A: cPanel → PHP Variables (Recommended)
1. Log into your BlueHost cPanel
2. Go to **Software** → **MultiPHP Manager**
3. **Select your domain** (`cliperton.tech`) by checking the checkbox
4. Click **PHP Options** button (should appear after selecting domain)
5. Look for **PHP Variables** or **Environment Variables** section
6. Add each variable one by one

**If PHP Options doesn't show PHP Variables section, try Alternative Method B below.**

#### Option B: .htaccess File (Most Reliable for BlueHost)
This is often the most reliable method for BlueHost shared hosting.

Create/edit `.htaccess` file in your `cliperton.tech` domain root:
```apache
SetEnv STRIPE_SECRET_KEY 
SetEnv STRIPE_WEBHOOK_SECRET 
SetEnv CLIPERTON_LICENSE_SALT 
```

**Note**: Use your test keys first for testing, then replace with live keys for production.

### 4. Install Stripe PHP Library

**For BlueHost users, use Option B (Manual Installation) as most shared hosting doesn't support Composer.**

#### Option B: Manual Installation (Recommended for BlueHost)

**Step-by-step instructions:**

1. **Download Stripe PHP Library**:
   - Go to [https://github.com/stripe/stripe-php/releases](https://github.com/stripe/stripe-php/releases)
   - Download the latest release ZIP file (e.g., `stripe-php-X.X.X.zip`)

2. **Extract the files locally**:
   - Extract the ZIP file on your computer
   - You'll see a folder structure like `stripe-php-X.X.X/`

3. **Access BlueHost File Manager**:
   - Log into your BlueHost cPanel
   - Go to **Files** → **File Manager**
   - Navigate to your domain: `public_html/cliperton.tech/`

4. **Create the directory structure**:
   - In File Manager, create folder: `api/`
   - Inside `api/`, create folder: `vendor/`
   - Inside `vendor/`, create folder: `stripe-php/`
   - Final path should be: `public_html/cliperton.tech/api/vendor/stripe-php/`

5. **Upload Stripe files**:
   - Upload ALL contents from the extracted `stripe-php-X.X.X/` folder
   - Into your server's `api/vendor/stripe-php/` directory
   - This includes folders like `lib/`, `init.php`, etc.

6. **Verify the installation**:
   - Check that `api/vendor/stripe-php/init.php` exists
   - This is the file your PHP scripts will include

**Alternative: Upload via FTP**
If you prefer FTP:
- Use FileZilla or similar FTP client
- Upload to the same `api/vendor/stripe-php/` path

### 5. File Permissions

Set correct permissions on your server:
```bash
chmod 755 public/api/
chmod 644 public/api/*.php
chmod 755 public/api/licenses/ (create this directory)
chmod 644 public/api/licenses.json (will be created automatically)
```

### 6. Email Configuration

#### Option A: PHP mail() function (Basic)
- Most shared hosting supports this out of the box
- Email headers are already updated for `cliperton.tech` domain
- No additional configuration needed

#### Option B: SMTP (Recommended for production)
- Install PHPMailer: `composer require phpmailer/phpmailer`
- Update webhook.php to use SMTP instead of mail()

### 7. Build and Deploy

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Upload files to your server**:
   - Upload all files from `dist/` to your domain root
   - Upload `public/` folder contents to your domain root
   - Ensure `api/` folder is accessible at `yourdomain.com/api/`

### 8. Test the Setup

#### Test Stripe Integration
1. **Use Stripe Test Mode first**:
   - Use test keys (starts with `pk_test_` and `sk_test_`)
   - **Test card details**:
     - Card Number: `4242 4242 4242 4242`
     - Expiry: Any future date (e.g., `12/25`, `01/26`)
     - CVC: Any 3 digits (e.g., `123`, `456`)
     - ZIP: Any 5 digits (e.g., `12345`)

2. **Test the flow**:
   - Visit your website
   - Click "Buy Pro Version"
   - Complete test purchase
   - Verify license email is sent
   - Check license appears on success page

#### Test Downloads
1. **Upload test files**:
   - Create `public/downloads/` folder
   - Upload `Cliperton Setup 1.0.0.zip` (free version)
   - Upload `Cliperton Pro Setup 1.0.0.zip` (pro version - same file for now)

2. **Test download flow**:
   - Test free download
   - Test that pro purchase redirects correctly

### 9. Go Live

1. **Switch to Live Mode**:
   - Replace test keys with live keys in environment variables
   - Update webhook endpoint to live mode
   - Test with small real transaction

2. **Monitor**:
   - Check `public/api/webhook_log.txt` for webhook events
   - Check `public/api/error_log.txt` for errors
   - Monitor Stripe dashboard for payments

## 🔒 Security Checklist

- [ ] All secret keys are in environment variables, not in code
- [ ] Webhook signature verification is enabled
- [ ] File permissions are set correctly
- [ ] `.env` file is in `.gitignore`
- [ ] Error reporting is disabled in production
- [ ] SSL certificate is installed and working

## 📁 File Structure After Setup

```
your-domain.com/
├── index.html
├── assets/ (CSS, JS from build)
├── api/
│   ├── create-checkout-session.php
│   ├── webhook.php
│   ├── get-license.php
│   ├── vendor/stripe-php/
│   ├── licenses.json
│   └── licenses/ (individual license files)
├── downloads/
│   ├── Cliperton Setup 1.0.0.zip
│   └── Cliperton Pro Setup 1.0.0.zip
├── success.html
├── cancel.html
├── privacy.html
└── terms.html
```

## 🐛 Troubleshooting

### Common Issues

**"Stripe failed to initialize"**
- Check VITE_STRIPE_PUBLISHABLE_KEY is set correctly
- Verify the key starts with `pk_`

**"Payment processing error"**
- Check server environment variables are set
- Verify Stripe PHP library is installed
- Check `api/error_log.txt` for details

**"Not Acceptable! Mod_Security error"**
- This is a BlueHost security feature blocking API requests
- **Solution 1**: Create separate `.htaccess` in your `api/` folder:
  ```apache
  SecRuleEngine Off
  ```
- **Solution 2**: Add this to your main `.htaccess` file (domain root):
  ```apache
  # Disable Mod_Security for API directory
  <Directory "api">
  SecRuleEngine Off
  </Directory>
  ```
- **Solution 3**: Rename your API files to avoid triggering Mod_Security:
  - `create-checkout-session.php` → `checkout.php`
  - Update your frontend to call `/api/checkout.php` instead

**Email not sending**
- Check server supports mail() function
- Verify email headers are correct
- Consider using SMTP instead

### Debug Mode

Enable debug mode by uncommenting these lines in PHP files:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

**Remember to disable in production!**

## 📧 Support

If you encounter issues:
1. Check the log files in `api/`
2. Verify all environment variables are set
3. Test with Stripe test mode first
4. Contact hosting provider for server-specific issues

## 🚀 Next Steps

After successful setup:
- Monitor conversion rates
- A/B test pricing and messaging
- Add customer testimonials
- Implement additional premium features
- Consider team licenses

---

**Important**: Keep your Stripe secret keys secure and never commit them to version control!
