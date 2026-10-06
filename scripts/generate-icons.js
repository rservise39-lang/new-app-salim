import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Base Icon SVG for standard any display
const standardSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E40AF" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Rounded App Icon Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>

  <!-- Decorative Paint Splash Accents -->
  <circle cx="110" cy="110" r="50" fill="#38BDF8" fill-opacity="0.3"/>
  <circle cx="410" cy="390" r="65" fill="#FBBF24" fill-opacity="0.25"/>
  <circle cx="430" cy="120" r="30" fill="#60A5FA" fill-opacity="0.35"/>

  <!-- Center Content with Shadow -->
  <g filter="url(#shadow)">
    <!-- House Structure -->
    <path d="M256 90 L390 200 L360 200 L360 330 L152 330 L152 200 L122 200 Z" fill="#FFFFFF"/>
    <!-- House Roof Line -->
    <path d="M256 75 L405 198 L380 220 L256 118 L132 220 L107 198 Z" fill="#FBBF24"/>
    <!-- House Windows -->
    <rect x="200" y="190" width="35" height="35" rx="6" fill="#38BDF8"/>
    <rect x="277" y="190" width="35" height="35" rx="6" fill="#38BDF8"/>
    <rect x="200" y="245" width="35" height="35" rx="6" fill="#38BDF8"/>
    <rect x="277" y="245" width="35" height="35" rx="6" fill="#38BDF8"/>

    <!-- Paint Roller Overlay -->
    <g transform="translate(180, 160) rotate(-22)">
      <!-- Roller Cylinder -->
      <rect x="0" y="0" width="180" height="48" rx="14" fill="url(#goldGrad)" stroke="#B45309" stroke-width="4"/>
      <!-- Paint Stripe on Cylinder -->
      <rect x="20" y="12" width="140" height="18" rx="8" fill="#FEF08A"/>
      <!-- Metal Roller Arm -->
      <path d="M180 24 L205 24 L205 75 L110 75 L110 115" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Ergonomic Handle -->
      <rect x="94" y="115" width="32" height="65" rx="10" fill="#0284C7" stroke="#FFFFFF" stroke-width="4"/>
    </g>
  </g>

  <!-- Typography / Brand Name -->
  <text x="256" y="440" font-family="'Cairo', Arial, sans-serif" font-weight="900" font-size="70" text-anchor="middle" fill="#FFFFFF" letter-spacing="2">
    صباغي
  </text>
  <text x="256" y="475" font-family="'Cairo', Arial, sans-serif" font-weight="600" font-size="22" text-anchor="middle" fill="#BAE6FD">
    حساب الأجور والتكاليف
  </text>
</svg>`;

// 2. Maskable Icon SVG (with 15% safe margin so Android squircle/circle cropping doesn't clip content)
const maskableSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E40AF" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="goldGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable (no rounded corners, fills entire 512x512 canvas) -->
  <rect width="512" height="512" fill="url(#bgGradMask)"/>

  <!-- Decorative Paint Splash in safe areas -->
  <circle cx="120" cy="120" r="45" fill="#38BDF8" fill-opacity="0.3"/>
  <circle cx="390" cy="380" r="55" fill="#FBBF24" fill-opacity="0.25"/>

  <!-- Scaled content inside safe zone (central 75% circle, scale ~ 0.78) -->
  <g transform="translate(56, 45) scale(0.78)">
    <!-- House Structure -->
    <path d="M256 90 L390 200 L360 200 L360 330 L152 330 L152 200 L122 200 Z" fill="#FFFFFF"/>
    <!-- House Roof Line -->
    <path d="M256 75 L405 198 L380 220 L256 118 L132 220 L107 198 Z" fill="#FBBF24"/>
    <!-- Windows -->
    <rect x="200" y="190" width="35" height="35" rx="6" fill="#38BDF8"/>
    <rect x="277" y="190" width="35" height="35" rx="6" fill="#38BDF8"/>
    <rect x="200" y="245" width="35" height="35" rx="6" fill="#38BDF8"/>
    <rect x="277" y="245" width="35" height="35" rx="6" fill="#38BDF8"/>

    <!-- Paint Roller Overlay -->
    <g transform="translate(180, 160) rotate(-22)">
      <rect x="0" y="0" width="180" height="48" rx="14" fill="url(#goldGradMask)" stroke="#B45309" stroke-width="4"/>
      <rect x="20" y="12" width="140" height="18" rx="8" fill="#FEF08A"/>
      <path d="M180 24 L205 24 L205 75 L110 75 L110 115" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="94" y="115" width="32" height="65" rx="10" fill="#0284C7" stroke="#FFFFFF" stroke-width="4"/>
    </g>

    <text x="256" y="440" font-family="'Cairo', Arial, sans-serif" font-weight="900" font-size="70" text-anchor="middle" fill="#FFFFFF">
      صباغي
    </text>
  </g>
</svg>`;

async function generate() {
  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvg);

  // Generate 512x512 standard
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Generate 192x192 standard
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // Generate 180x180 apple touch icon
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Generate 512x512 maskable
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Generate favicon.png
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('All PWA icons generated successfully in /public');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
