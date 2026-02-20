# Screenshot Capture Guide
**Context Pack Builder - Visual Documentation**

## 📸 Screenshot Locations & Specifications

### How to Capture Screenshots

**Prerequisites:**
1. Deploy app locally: `pnpm dev`
2. Open http://localhost:3000 in Chrome/Edge
3. Use F12 > Device Toolbar for responsive views
4. Use system dark mode toggle for theme switching

---

## Required Screenshots

### 1. Empty State (`screenshots/01-empty-state.png`)
**Size:** 1200 x 800px
**Device:** Desktop (1440px)
**Theme:** Light mode

**How to Capture:**
```
1. Open http://localhost:3000
2. Clear any existing data (fresh install)
3. Resize browser: 1440px width
4. Zoom: 100%
5. Capture: Full widget view
```

**Expected Content:**
- Package icon (48px)
- Heading: "Build Your First Context Pack"
- Example goals visible
- Purple gradient header
- Empty state styling

---

### 2. Input Focus (`screenshots/02-input-focus.png`)
**Size:** 1200 x 600px
**Device:** Desktop
**Theme:** Light mode

**How to Capture:**
```
1. Click into goal input field
2. Ensure cursor blinking visible
3. Show focus state (purple border)
4. Capture: Input area + header
```

**Expected Effects:**
- Purple border on input (2px)
- Subtle lift effect (translateY -1px)
- Glassmorphism visible
- Placeholder text clear

---

### 3. Loading State (`screenshots/03-loading-state.png`)
**Size:** 1200 x 800px
**Device:** Desktop
**Theme:** Light mode

**How to Capture:**
```
1. Type goal: "Ship feature X"
2. Click "Build Context Pack"
3. Immediately capture (within 0.5s)
4. Ensure spinner is mid-rotation
```

**Expected Content:**
- Button text: "Building..."
- Purple spinner (40px, rotating)
- Message: "Gathering context from files and code..."
- Input disabled state

---

### 4. Success with Context Pack (`screenshots/04-success-with-pack.png`)
**Size:** 1200 x 1400px (tall screenshot)
**Device:** Desktop
**Theme:** Light mode

**How to Capture:**
```
1. Wait for pack generation to complete
2. Ensure success toast visible (capture within 3s)
3. Scroll to show all sections
4. Use tall screenshot or stitch multiple
```

**Expected Sections:**
```
✅ Success Toast (top)
📝 Summary Section
📚 Resources Section
   - Code resources
   - Docs resources
❓ Open Questions Section
✅ Next Actions Section
```

**Visual Effects to Capture:**
- Glassmorphism on all cards
- Backdrop blur visible
- Purple gradients
- Type badges (Code, Docs, Other)
- Numbered actions

---

### 5. Past Packs (`screenshots/05-past-packs.png`)
**Size:** 1200 x 900px
**Device:** Desktop
**Theme:** Light mode

**How to Capture:**
```
1. Generate 3-5 different context packs:
   - "Ship feature X"
   - "Debug incident 123"
   - "Prepare Q2 review"
2. Scroll to "Recent Context Packs"
3. Hover over second pack (show hover state)
4. Capture: Current pack + past packs list
```

**Expected Content:**
- Current pack visible (partial)
- "Recent Context Packs" heading
- 3-5 past pack cards
- Hover state on one pack (purple border)
- Resource/action counts visible

---

### 6. Error State (`screenshots/06-error-state.png`)
**Size:** 1200 x 700px
**Device:** Desktop
**Theme:** Light mode

**How to Capture:**
```
1. Trigger error (disconnect API or use invalid key)
2. Attempt to build pack
3. Wait for error toast to appear
4. Capture: Error toast + form area
```

**Expected Content:**
- Red error toast with alert icon
- Error message text
- Dismiss button (×)
- Input field still functional
- Empty state or previous pack below

---

### 7. Dark Mode (`screenshots/07-dark-mode.png`)
**Size:** 1200 x 1400px
**Device:** Desktop
**Theme:** Dark mode

**How to Capture:**
```
1. Toggle system to dark mode
2. Refresh page
3. Generate a context pack
4. Capture: Full pack in dark theme
```

**Expected Dark Mode Colors:**
```
Background: Dark gray/black
Text: Light gray (#e4e4e7)
Glassmorphism: rgba(0, 0, 0, 0.2)
Borders: rgba(255, 255, 255, 0.08)
Purple gradient: Still vibrant
Shadows: More prominent
```

---

### 8. Mobile View (`screenshots/08-mobile.png`)
**Size:** 375 x 812px (iPhone X)
**Device:** Mobile
**Theme:** Light mode

**How to Capture:**
```
1. F12 > Device Toolbar
2. Select "iPhone 12 Pro" (375px)
3. Generate context pack
4. Capture: Full scrollable view (stitched)
```

**Expected Layout:**
- Single column (all sections stack)
- Input full width
- Button full width
- Past packs stack vertically
- Touch-friendly tap targets

---

### 9. Tablet View (`screenshots/09-tablet.png`)
**Size:** 768 x 1024px (iPad)
**Device:** Tablet
**Theme:** Light mode

**How to Capture:**
```
1. F12 > Device Toolbar
2. Select "iPad" (768px)
3. Generate context pack
4. Capture: Full view
```

**Expected Layout:**
- Bento grid partially active
- Questions + Actions side-by-side
- Summary/Resources full width
- Comfortable spacing

---

### 10. Desktop Wide (`screenshots/10-desktop.png`)
**Size:** 1920 x 1200px
**Device:** Desktop
**Theme:** Light mode

**How to Capture:**
```
1. Maximize browser (1920px)
2. Generate context pack
3. Observe centered max-width (640px)
4. Capture: Full viewport
```

**Expected Layout:**
- Content centered with max-width
- Bento grid fully active
- Whitespace on sides
- Professional spacing

---

## Demo Screenshots (for README)

### 11. Hero Screenshot (`screenshots/demo-hero.png`)
**Size:** 1600 x 1000px
**Purpose:** README header image

**Composition:**
```
Top half: Header + input form
Bottom half: Context pack preview (partial)
Focus: Show brand (purple gradient)
Quality: High-res, sharp text
```

**Capture Settings:**
```
Browser zoom: 100%
Window: Maximized
Theme: Light mode
Pack: "Ship feature X" (demo-repo)
```

---

### 12. Glassmorphism Detail (`screenshots/demo-glassmorphism.png`)
**Size:** 800 x 600px
**Purpose:** Show off glassmorphism effects

**Composition:**
```
Zoom into a single card section
Show backdrop blur clearly
Capture shadows and borders
Highlight visual depth
```

**Best Section:** Resources section (most visual elements)

---

### 13. Animated Demo (`screenshots/demo-animation.gif`)
**Size:** 1200 x 800px, 5-10 seconds
**Purpose:** Show interactions in action

**Recording Steps:**
```
1. Use LICEcap or ScreenToGif
2. Set FPS: 30
3. Record sequence:
   - Hover over header (gradient animates)
   - Type in input (focus effect)
   - Click button (loading state)
   - Pack appears (success toast)
   - Hover resource item (slide + glow)
   - Total: 8-10 seconds
```

**Output:** Optimize GIF < 5MB for README

---

## Screenshot Naming Convention

```
Format: [number]-[descriptive-name].png

Examples:
✅ 01-empty-state.png
✅ 04-success-with-pack.png
✅ 07-dark-mode.png
✅ demo-hero.png
✅ demo-animation.gif

❌ screenshot1.png
❌ test.png
❌ Image-2026-02-20.png
```

---

## Screenshot Quality Requirements

### Technical Specs
```
Format: PNG (lossless) or WebP
Color: RGB, 8-bit
DPI: 72 (web standard)
Compression: Medium (balance size/quality)
Size limit: < 1MB per image (< 5MB for GIF)
```

### Visual Quality
```
✅ No browser chrome visible (unless intentional)
✅ Sharp text (no blur)
✅ Accurate colors
✅ Proper lighting
✅ No distracting backgrounds
✅ Consistent styling across shots
```

---

## Folder Structure

```
hacknight-repo/
├── screenshots/
│   ├── 01-empty-state.png
│   ├── 02-input-focus.png
│   ├── 03-loading-state.png
│   ├── 04-success-with-pack.png
│   ├── 05-past-packs.png
│   ├── 06-error-state.png
│   ├── 07-dark-mode.png
│   ├── 08-mobile.png
│   ├── 09-tablet.png
│   ├── 10-desktop.png
│   ├── demo-hero.png
│   ├── demo-glassmorphism.png
│   └── demo-animation.gif
└── SCREENSHOT-GUIDE.md
```

---

## Quick Capture Script

Save as `capture-screenshots.sh`:

```bash
#!/bin/bash
# Screenshot automation using puppeteer

mkdir -p screenshots

# Start dev server
pnpm dev &
DEV_PID=$!

# Wait for server
sleep 5

# Capture screenshots (requires node puppeteer script)
node scripts/screenshot-automation.js

# Stop dev server
kill $DEV_PID

echo "✅ Screenshots captured in screenshots/"
```

---

## Post-Processing

### Optimization
```bash
# Install imageoptim-cli (macOS) or pngquant (cross-platform)
brew install imageoptim-cli

# Optimize all PNGs
imageoptim screenshots/*.png

# Or use pngquant
pngquant --quality=65-80 screenshots/*.png
```

### Add to README
```markdown
## Screenshots

### Light Mode
![Context Pack Builder](screenshots/demo-hero.png)

### Dark Mode
![Dark Mode](screenshots/07-dark-mode.png)

### Mobile Responsive
![Mobile View](screenshots/08-mobile.png)

### Animation Demo
![Interactions](screenshots/demo-animation.gif)
```

---

## Checklist

Before marking screenshots as complete:

- [ ] All 10 required screenshots captured
- [ ] All 3 demo screenshots captured
- [ ] Consistent quality across all images
- [ ] File sizes optimized (< 1MB each)
- [ ] Naming convention followed
- [ ] Screenshots added to README
- [ ] Glassmorphism effects clearly visible
- [ ] Purple gradient brand visible
- [ ] Dark mode properly styled
- [ ] Mobile responsive shown
- [ ] Animations captured (GIF)

---

**Guide Created**: 2026-02-20
**Last Updated**: 2026-02-20
**Next Step**: Capture screenshots following this guide
