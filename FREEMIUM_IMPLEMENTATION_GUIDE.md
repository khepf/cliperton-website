# Cliperton Freemium Implementation Guide

**Goal**: Convert Cliperton to a freemium model where basic clipboard management is free, but save/load functionality requires a $5 one-time purchase.

## Current Architecture Analysis

### Cliperton App (Electron Desktop App)
- **Core Features**: Clipboard monitoring, history display, click-to-copy, pin items, clear history
- **Premium Features**: Save/Load clipboard groups (already implemented)
- **Technology**: Electron, TypeScript, with main process (`main.ts`), renderer (`renderer.ts`), and preload scripts
- **Save/Load Implementation**: Uses file dialogs to save/load JSON files with clipboard groups

### Cliperton Website (React + Vite)
- **Purpose**: Marketing site with download functionality
- **Technology**: React, TypeScript, Vite
- **Current Download**: Free download of the full app via `download.php`

## Implementation Strategy

### 1. App-Side Changes (Cliperton)

#### License Key System
- Add a license validation system in `main.ts`
- Store license status in local storage or encrypted config file
- Add license activation UI in the renderer

#### Feature Gating
- Modify the save/load button handlers to check license status
- Show upgrade prompts when unlicensed users try to access premium features
- Keep the UI elements visible but disabled with upgrade messaging

#### Key Files to Modify
- `src/main.ts`: Add license validation logic
- `src/renderer.ts`: Add license checking for save/load buttons
- `renderer/index.html`: Add upgrade modal/dialog
- `src/types.ts`: Add license-related interfaces

#### Example Implementation

**License Interface (add to `src/types.ts`):**
```typescript
export interface LicenseInfo {
    key: string;
    isValid: boolean;
    activatedAt: number;
    email?: string;
}

export interface ElectronAPI {
    // ... existing methods
    checkLicense: () => Promise<boolean>;
    activateLicense: (key: string, email?: string) => Promise<boolean>;
    getLicenseInfo: () => Promise<LicenseInfo | null>;
}
```

**Main Process License Logic (add to `src/main.ts`):**
```typescript
private licenseInfo: LicenseInfo | null = null;

private validateLicense(key: string): boolean {
    // Simple validation - in production, use proper cryptographic validation
    const validPattern = /^CLIP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return validPattern.test(key);
}

private isFeatureUnlocked(): boolean {
    return this.licenseInfo?.isValid || false;
}

// Add to setupIpcHandlers()
ipcMain.handle('check-license', () => {
    return this.isFeatureUnlocked();
});

ipcMain.handle('activate-license', async (_, key: string, email?: string) => {
    if (this.validateLicense(key)) {
        this.licenseInfo = {
            key,
            isValid: true,
            activatedAt: Date.now(),
            email
        };
        // Save to secure storage
        await this.saveLicenseInfo();
        return true;
    }
    return false;
});
```

**Renderer License Checking (modify `src/renderer.ts`):**
```typescript
private async handleSaveGroup() {
    const isLicensed = await this.electronAPI.checkLicense();
    if (!isLicensed) {
        this.showUpgradeDialog('save');
        return;
    }
    // Existing save logic...
}

private async handleLoadGroup() {
    const isLicensed = await this.electronAPI.checkLicense();
    if (!isLicensed) {
        this.showUpgradeDialog('load');
        return;
    }
    // Existing load logic...
}

private showUpgradeDialog(feature: 'save' | 'load') {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🔓 Unlock Premium Features</h2>
            <p>The ${feature} feature requires Cliperton Pro.</p>
            <p><strong>Upgrade for just $5</strong> to unlock:</p>
            <ul>
                <li>Save clipboard groups to files</li>
                <li>Load saved clipboard groups</li>
                <li>Share your clipboard groups</li>
            </ul>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="this.openUpgradeUrl()">Upgrade Now ($5)</button>
                <button class="btn btn-secondary" onclick="this.closeModal()">Maybe Later</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
```

#### UI Changes (modify `renderer/index.html`)
```html
<!-- Add upgrade modal styles -->
<style>
.upgrade-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 400px;
    text-align: center;
}

.upgrade-modal ul {
    text-align: left;
    margin: 20px 0;
}

.modal-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
}
</style>
```

### 2. Website Changes (Cliperton Website)

#### Dual Download Strategy

**Modify `src/components/Download.tsx`:**
```tsx
const Download: React.FC = () => {
  return (
    <section id="download" className="download">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Choose Your Version</h2>
          <p className="section-description">
            Start free or unlock premium features
          </p>
        </div>

        <div className="download-options">
          {/* Free Version */}
          <div className="download-card">
            <div className="download-header">
              <h3 className="download-title">
                <span className="platform-icon">🆓</span>
                Cliperton Free
              </h3>
              <p className="download-price">$0</p>
            </div>
            <div className="download-features">
              <ul>
                <li>✅ Clipboard history (50 items)</li>
                <li>✅ Click to copy</li>
                <li>✅ Pin important items</li>
                <li>✅ Global shortcuts</li>
                <li>❌ Save clipboard groups</li>
                <li>❌ Load clipboard groups</li>
              </ul>
            </div>
            <button onClick={handleFreeDownload} className="download-btn">
              Download Free
            </button>
          </div>

          {/* Pro Version */}
          <div className="download-card featured">
            <div className="download-header">
              <h3 className="download-title">
                <span className="platform-icon">⭐</span>
                Cliperton Pro
              </h3>
              <p className="download-price">$5 <span className="price-note">one-time</span></p>
            </div>
            <div className="download-features">
              <ul>
                <li>✅ Everything in Free</li>
                <li>✅ Save clipboard groups</li>
                <li>✅ Load saved groups</li>
                <li>✅ Import/Export collections</li>
                <li>✅ Backup & share clipboard history</li>
                <li>✅ Lifetime updates</li>
              </ul>
            </div>
            <button onClick={handleProPurchase} className="download-btn btn-primary">
              Buy Pro Version ($5)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
```

#### Payment Integration

**Add Stripe Integration:**
```tsx
// Install: npm install @stripe/stripe-js

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_your_publishable_key_here');

const handleProPurchase = async () => {
  const stripe = await stripePromise;
  
  // Call your backend to create checkout session
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product: 'cliperton-pro',
      price: 500, // $5.00 in cents
    }),
  });

  const session = await response.json();
  
  // Redirect to Stripe Checkout
  const result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });
};
```

#### Backend Payment Processing

**Create `public/api/create-checkout-session.php`:**
```php
<?php
require_once 'vendor/autoload.php';

\Stripe\Stripe::setApiKey('sk_your_secret_key_here');

header('Content-Type: application/json');

try {
    $checkout_session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => 'Cliperton Pro License',
                    'description' => 'Unlock save/load features for Cliperton clipboard manager',
                ],
                'unit_amount' => 500, // $5.00
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => 'https://yoursite.com/success?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => 'https://yoursite.com/cancel',
        'metadata' => [
            'product_type' => 'cliperton_pro_license'
        ]
    ]);

    echo json_encode(['id' => $checkout_session->id]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
```

#### License Key Generation

**Create `public/api/generate-license.php`:**
```php
<?php
function generateLicenseKey($email, $timestamp) {
    // Simple but sufficient for a $5 product
    $hash = hash('sha256', $email . $timestamp . 'cliperton_secret_salt');
    $key = 'CLIP-' . 
           strtoupper(substr($hash, 0, 4)) . '-' .
           strtoupper(substr($hash, 4, 4)) . '-' .
           strtoupper(substr($hash, 8, 4));
    return $key;
}

// Handle Stripe webhook for successful payments
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
$endpoint_secret = 'whsec_your_webhook_secret';

try {
    $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
    
    if ($event['type'] == 'checkout.session.completed') {
        $session = $event['data']['object'];
        $customerEmail = $session['customer_details']['email'];
        
        // Generate license key
        $licenseKey = generateLicenseKey($customerEmail, time());
        
        // Save to database
        // Send email with license key
        // Provide download link for pro version
        
        error_log("License generated: $licenseKey for $customerEmail");
    }
} catch(\UnexpectedValueException $e) {
    http_response_code(400);
    exit();
}
?>
```

### 3. Distribution Strategy

#### Recommended Approach: Single App with License Activation

**Benefits:**
- Simpler distribution (one download)
- Easy upgrades (just enter license key)
- Better user experience
- Reduced maintenance overhead

**Implementation:**
1. Distribute single app with all features
2. Premium features disabled by default
3. User enters license key to unlock
4. App validates key locally (offline validation)

#### Alternative: Separate Free/Pro Downloads

**Free Version Build:**
```json
// package.json - add build script
"scripts": {
  "build:free": "tsc && cross-env CLIPERTON_VERSION=free electron-builder",
  "build:pro": "tsc && cross-env CLIPERTON_VERSION=pro electron-builder"
}
```

**Conditional Feature Compilation:**
```typescript
// src/config.ts
export const IS_PRO_VERSION = process.env.CLIPERTON_VERSION === 'pro';
export const FEATURES = {
  saveLoad: IS_PRO_VERSION
};
```

### 4. Marketing and Positioning

#### Value Proposition
- **Free**: "Perfect for basic clipboard management"
- **Pro ($5)**: "Persistent clipboard groups for power users"

#### Feature Messaging
```markdown
## Free vs Pro Comparison

| Feature | Free | Pro |
|---------|------|-----|
| Clipboard History (50 items) | ✅ | ✅ |
| Click to Copy | ✅ | ✅ |
| Pin Important Items | ✅ | ✅ |
| Global Shortcuts (Ctrl+Shift+V) | ✅ | ✅ |
| System Tray Integration | ✅ | ✅ |
| Cross-Platform Support | ✅ | ✅ |
| **Save Clipboard Groups** | ❌ | ✅ |
| **Load Saved Groups** | ❌ | ✅ |
| **Import/Export Collections** | ❌ | ✅ |
| **Backup & Share History** | ❌ | ✅ |
| **Lifetime Updates** | ❌ | ✅ |
```

#### Target Audience for Pro
- Developers who switch between projects
- Writers managing research snippets
- Content creators with template collections
- Productivity enthusiasts
- Teams sharing common clipboard items

### 5. Technical Security Considerations

#### License Validation
```typescript
// Simple but effective validation for a $5 product
class LicenseValidator {
    private static readonly SECRET_SALT = 'cliperton_license_salt_2025';
    
    static validate(key: string, email?: string): boolean {
        if (!key.match(/^CLIP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
            return false;
        }
        
        // Additional validation logic
        // Don't over-engineer for a $5 product
        return true;
    }
    
    static isExpired(activationDate: number): boolean {
        // No expiration for one-time purchase
        return false;
    }
}
```

#### Storage Security
```typescript
// Store license in encrypted form
import * as crypto from 'crypto';

class LicenseStorage {
    private static readonly ENCRYPTION_KEY = 'your-32-char-key-here';
    
    static save(licenseInfo: LicenseInfo): void {
        const encrypted = this.encrypt(JSON.stringify(licenseInfo));
        // Save to app data folder
        fs.writeFileSync(this.getLicensePath(), encrypted);
    }
    
    static load(): LicenseInfo | null {
        try {
            const encrypted = fs.readFileSync(this.getLicensePath(), 'utf8');
            const decrypted = this.decrypt(encrypted);
            return JSON.parse(decrypted);
        } catch {
            return null;
        }
    }
    
    private static encrypt(text: string): string {
        // Simple encryption - adequate for this use case
        const cipher = crypto.createCipher('aes192', this.ENCRYPTION_KEY);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    
    private static decrypt(text: string): string {
        const decipher = crypto.createDecipher('aes192', this.ENCRYPTION_KEY);
        let decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
```

### 6. Implementation Timeline

#### Phase 1: Core License System (1-2 weeks)
1. ✅ Add license validation to Electron app
2. ✅ Implement feature gating for save/load
3. ✅ Create upgrade prompts and UI
4. ✅ Add license activation interface
5. ✅ Test license storage and validation

#### Phase 2: Payment Integration (1 week)
1. ✅ Set up Stripe account and keys
2. ✅ Implement checkout flow on website
3. ✅ Create webhook for license generation
4. ✅ Set up automated email delivery
5. ✅ Test end-to-end purchase flow

#### Phase 3: Website Updates (3-5 days)
1. ✅ Update download page with free/pro options
2. ✅ Add pricing comparison section
3. ✅ Update features page with pro indicators
4. ✅ Create success/cancellation pages
5. ✅ Update marketing copy throughout site

#### Phase 4: Testing & Launch (3-5 days)
1. ✅ Comprehensive testing of all flows
2. ✅ Beta testing with selected users
3. ✅ Documentation updates
4. ✅ Launch announcement preparation
5. ✅ Monitor initial sales and feedback

### 7. Success Metrics

#### Technical Metrics
- License activation success rate (target: >95%)
- Payment completion rate (target: >80%)
- App crash rate with license system (target: <0.1%)
- License validation performance (target: <100ms)

#### Business Metrics
- Conversion rate free → pro (target: 5-10%)
- Monthly pro sales (target: 50+ in first month)
- Customer support tickets (target: <10% of sales)
- User retention with pro features (target: >90%)

### 8. Post-Launch Considerations

#### Customer Support
- Clear documentation for license activation
- FAQ for common license issues
- Email support for purchase problems
- Refund policy (14-day no questions asked)

#### Feature Development
- Prioritize pro features based on user feedback
- Consider additional premium tiers ($10, $20)
- Potential subscription model for cloud sync
- Team licenses for organizations

#### Marketing
- Content marketing around productivity
- Showcasing pro feature workflows
- User testimonials and case studies
- Referral program for existing users

---

## Quick Start Checklist

### Before Implementation
- [ ] Set up Stripe account
- [ ] Choose license key format and validation
- [ ] Design upgrade UI/UX
- [ ] Plan customer communication flow

### Implementation Order
1. [ ] Add license system to Electron app
2. [ ] Implement feature gating
3. [ ] Create upgrade prompts
4. [ ] Set up payment processing
5. [ ] Update website with pricing
6. [ ] Test complete user journey
7. [ ] Launch and monitor

### Post-Launch
- [ ] Monitor conversion rates
- [ ] Collect user feedback
- [ ] Iterate on upgrade messaging
- [ ] Plan next premium features

---

**Note**: This is a balanced approach that provides value at both tiers while keeping implementation complexity reasonable for a solo developer or small team. The $5 price point is accessible while the features provide clear value for users who need persistence and sharing capabilities.
