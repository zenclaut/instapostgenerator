# 🔥 BGY Post & Carousel Generator Studio

A modern, high-performance web application engineered for creating professional Instagram Carousel and single-image posts with custom visual layer management, rich typography, category templates, and ultra-high-resolution rendering.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel)](https://bgypostgenerator.vercel.app)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TailwindCSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

## 🌟 Key Features

### 📐 1. Instagram High-Definition Standards (1080×1440 & 1:1)
- **1080×1440 Portrait Mode**: Optimized aspect ratio for vertical feeds.
- **1080×1080 Square Mode**: Classic square post ratio.
- **Ultra HD (2x) Export Option**: Export at **2160×2880 px** for maximum clarity and pixel density.

### 🎨 2. Dynamic Visual Layer & Asset Engine
- **No Procedural Shortcuts**: Overlays are rendered using real image assets (`corner.PNG`, `gradient-bold.PNG`, `gradient-low.PNG`, `name.PNG`, `logo.PNG`, `swipe.PNG`).
- **Layer Stacking Hierarchy (Z-Index)**:
  - Background photo with drag-and-drop framing, zoom, pan X/Y, brightness, and contrast.
  - `gradient-bold.PNG` stays beneath `gradient-low.PNG` in the layer stack; both can be active concurrently.
  - Category badges (`name.PNG`), frame corners (`corner.PNG`), logos (`logo.PNG`), and swipe badges (`swipe.PNG`).
- **Granular Controls per Layer**:
  - Checkbox toggles (Active / Inactive).
  - Opacity slider (0% – 100%).
  - Scale / Size slider (0.5x – 2.0x).
  - Horizontal & Vertical Position (X / Y Offset).
  - Layer Reordering (Z-Index Up / Down).
  - Image replacement and layer deletion.
- **Custom Layer Uploads**: Upload any PNG, SVG, or WEBP image to embed as a persistent layer.

### ✨ 3. Category & Template System (IndexedDB Storage)
- **Built-in Presets**: Pre-configured categories (`News / Haberler`, `Gaming / Oyun`) with bundled assets and typography.
- **Custom Category Creation**: Create custom categories with custom names, typography fonts, accent colors, and custom layer sets.
- **Template Management**:
  - Save layer configurations as custom templates (e.g. *Minimal*, *Headline Focus*, *Full Overlay*).
  - Save current layers as Category Defaults so every new slide inherits them.
  - All categories and templates persist in local **IndexedDB** (`Dexie.js`).

### ✍️ 4. Rich Text Editor & Typography
- **Word-by-word Formatting**: Bold, italic, underline, custom text alignment (Left, Center, Right), font size scaling (20px – 42px).
- **One-Click Category Highlight**: Instantly bold and color selected words with the category's primary accent color.
- **Color Palettes**: Category-specific colors + Classic color chips + Full RGB color picker.

### 📚 5. Multi-Slide Carousel Architecture
- Add, duplicate, reorder (Move Left / Move Right), and delete slides with real-time thumbnail previews.
- Slide-by-slide category assignments.
- Toggleable pagination dots indicator on the canvas.

### 🌍 6. Internationalization (i18n)
- Seamless 1-click **Turkish (TR 🇹🇷)** and **English (EN 🇬🇧)** language switching.
- User language preference is automatically persisted.

### 📦 7. One-Click Gallery & ZIP Export
- **Export Modal**: Preview all carousel slides simultaneously in a gallery grid.
- **Batch Export**: Download the entire carousel as a single `.ZIP` archive (`JSZip` + `FileSaver`).
- **Single Slide PNG Download & Copy to Clipboard**: Instant PNG export or clipboard copy for fast sharing.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript |
| **Build Tool & Bundler** | Vite 8 |
| **Styling & Design System** | TailwindCSS v4 + Glassmorphism Dark UI |
| **Icons** | Lucide React |
| **Database** | IndexedDB via Dexie.js (for Categories & Templates) |
| **Canvas Rendering** | Native HTML5 Canvas 2D Rendering Engine |
| **ZIP Packaging** | JSZip + FileSaver |
| **Internationalization** | Context-based lightweight reactive i18n |
| **Deployment** | Vercel Serverless Platform |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- `npm` or `pnpm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/zenclaut/bgypostgenerator.git
   cd bgypostgenerator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
bgypostgenerator/
├── categories/               # Real category image assets & font.txt
│   ├── haberler/             # News: corner, gradients, logo, name, swipe, font.txt
│   └── oyun/                 # Gaming: corner, gradients, logo, name, swipe, font.txt
├── public/                   # Public static web assets
│   └── categories/           # Synced category assets for Vite serving
├── src/
│   ├── components/
│   │   ├── editor/           # SlideTabs, ImageUploader, LayerTemplateManager, RichTextEditor, SlideSettings
│   │   ├── export/           # ExportModal (ZIP export & gallery view)
│   │   └── preview/          # CanvasPreview (Live HTML5 canvas render & controls)
│   ├── db/                   # Dexie.js IndexedDB schema & helpers
│   ├── engine/               # canvasRenderer, categoryLoader, zipExporter
│   ├── i18n/                 # translations.ts (TR/EN) & LanguageContext.tsx
│   ├── types/                # TypeScript interface definitions
│   ├── App.tsx               # Studio orchestrator layout
│   └── main.tsx              # Application entry point with LanguageProvider
├── package.json
└── vite.config.ts
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
