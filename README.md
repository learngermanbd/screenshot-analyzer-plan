# 📐 ScreenAnalyzer — Mobile Screenshot Analyzer & Design Builder

Upload a mobile app screenshot and instantly get **measurements**, **color palettes**, **font specs**, and **detected UI components**. Then **build**, **prototype**, and **export production code** — all for free.

🔗 **Live Demo:** [Coming Soon](https://screenshot-analyzer-plan.vercel.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **AI Analysis** | Detect UI elements, extract colors, fonts, spacing, and measurements from any mobile screenshot |
| 🎨 **Design Builder** | Drag-and-drop canvas powered by Craft.js — free-form and grid modes |
| 📱 **Prototype Mode** | Click interactions, screen transitions, phone-frame preview |
| 🔎 **Inspect Mode** | Get CSS, React, Vue, Jetpack Compose, and Kotlin/XML code for any element |
| 📤 **Code Export** | 6 formats: React+Tailwind, Vue+Tailwind, HTML+CSS, Jetpack Compose, Kotlin/XML, JSON |
| 💰 **100% Free** | Built entirely on free-tier services. No credit card. $0/month |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | App framework |
| **Styling** | Tailwind CSS 3 | Utility-first CSS |
| **Builder** | Craft.js | Drag-and-drop editor |
| **ML Service** | FastAPI, OpenCV, Tesseract OCR | Screenshot analysis pipeline |
| **AI** | Google Gemini 2.0 Flash | Semantic analysis + code generation |
| **Database** | Supabase (PostgreSQL) | Data storage |
| **Storage** | Cloudflare R2 | Image storage |
| **Cache** | Upstash Redis | Response caching |
| **Hosting** | Vercel (frontend), Hugging Face Spaces (ML) | Free hosting |

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/learngermanbd/screenshot-analyzer-plan.git
cd screenshot-analyzer-plan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys. See [setup-guide.html](./setup-guide.html) for detailed instructions.

**Minimum required for local development:**
- `GEMINI_API_KEY` — Get from [Google AI Studio](https://aistudio.google.com/) (free)

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. (Optional) Run the ML service locally

```bash
cd ml-service
pip install -r requirements.txt
python main.py
```

The ML service runs on port 8000. Set `ML_SERVICE_URL=http://localhost:8000` in `.env.local`.

---

## 📁 Project Structure

```
screenshot-analyzer/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── analyze/page.tsx      # Screenshot analysis
│   │   ├── builder/page.tsx      # Craft.js design builder
│   │   ├── prototype/page.tsx    # Interactive prototyping
│   │   └── api/
│   │       ├── analyze/route.ts  # Analysis API endpoint
│   │       └── export/route.ts   # Code export API endpoint
│   ├── components/
│   │   ├── analysis/             # Analysis canvas, color palette, specs
│   │   ├── builder/              # Craft.js nodes, canvas, toolbar
│   │   ├── inspect/              # Code preview, inspect overlay
│   │   ├── prototype/            # Phone preview, interactions
│   │   ├── ui/                   # Shared UI (Navbar)
│   │   └── upload/               # Upload zone
│   ├── lib/                      # Utilities, API clients, helpers
│   └── types/                    # TypeScript type definitions
├── ml-service/
│   ├── main.py                   # FastAPI server
│   ├── pipeline/                 # Analysis pipeline modules
│   │   ├── preprocess.py         # Image preprocessing (OpenCV)
│   │   ├── detect.py             # UI element detection
│   │   ├── ocr.py                # Text extraction (PaddleOCR)
│   │   ├── colors.py             # Color extraction (K-Means)
│   │   └── analyze.py            # Semantic analysis (Gemini)
│   ├── models/schemas.py         # Pydantic models
│   ├── requirements.txt
│   └── Dockerfile
├── prisma/schema.prisma          # Database schema
├── plan.html                     # Full project plan document
├── setup-guide.html              # Account setup instructions
└── package.json
```

---

## 📦 Export Formats

| Format | Engine | Output |
|--------|--------|--------|
| React + Tailwind | Gemini API | React components with Tailwind classes |
| Vue + Tailwind | Gemini API | Vue 3 Composition API components |
| HTML + CSS | Client-side | Semantic HTML5 with inline styles |
| Jetpack Compose | Gemini API | Android @Composable functions |
| Kotlin/XML | Gemini API | Android XML layouts |
| JSON | Client-side | Raw design data for re-import |

---

## 🆓 Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| Gemini API | 1,500 requests/day |
| Supabase | 500MB database, 1GB storage |
| Vercel | 100GB bandwidth/month |
| Cloudflare R2 | 10GB storage, $0 egress |
| Upstash Redis | 500K commands/month |
| Hugging Face | 16GB RAM, 2 CPU cores |
| Sentry | 5K errors/month |

**Total cost: $0/month**

---

## 📄 Documentation

- **[Plan Document](./plan.html)** — Full project plan with 19 sections
- **[Setup Guide](./setup-guide.html)** — Step-by-step account setup with visuals

---

## 📝 License

MIT License — see [LICENSE](./LICENSE) for details.
