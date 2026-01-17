# 🌍 CO2DE - Code Environmental Impact Analyzer

![CO2DE Logo](resources/co2de_logo.png)

**CO2DE** helps developers instantly understand the environmental footprint of their code. It estimates energy/CO₂ impact and provides AI-powered insights with actionable optimizations.

## 🎯 Vision

Every line of code has an environmental cost. CO2DE makes this visible, helping developers write more efficient, sustainable software.

## ⚡ Features

- **📤 Code Upload** - Drag-and-drop file upload supporting 100+ file types
- **⚡ Energy Estimation** - Instant estimates of energy consumption and CO₂ footprint
- **🤖 AI-Powered Review** - Intelligent analysis with optimization recommendations
- **📊 Visual Dashboard** - Beautiful charts and metrics visualization
- **🔄 Real-time Updates** - Live analysis with smooth animations

## 🔧 Tech Stack

| Category      | Technology               |
| ------------- | ------------------------ |
| Framework     | Next.js 16 (App Router)  |
| UI            | React 19 + TailwindCSS 4 |
| Animations    | CSS Animations           |
| Charts        | Recharts                 |
| File Upload   | react-dropzone           |
| Validation    | Zod                      |
| Backend Ready | Appwrite SDK             |
| Icons         | Lucide React             |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Govinda2809/Co2de.git

# Navigate to project
cd Co2de

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
Co2de/
├── app/                      # Next.js App Router pages
│   ├── analyze/              # Code analysis page
│   ├── dashboard/            # Analysis history
│   ├── about/                # About page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/
│   ├── dashboard/            # Dashboard components
│   │   ├── metrics-display   # Energy metrics cards
│   │   ├── energy-chart      # Score visualization
│   │   └── ai-review-card    # AI recommendations
│   ├── layout/               # Header & Footer
│   ├── ui/                   # Base UI components
│   └── upload/               # File upload component
├── lib/
│   ├── appwrite.ts           # Appwrite client config
│   ├── energy.ts             # Energy calculation logic
│   ├── schemas.ts            # Zod validation schemas
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## 🛠️ How It Works

1. **Upload** - Drop your code file (supports .js, .ts, .py, .java, .rs, .go, etc.)
2. **Analyze** - CO2DE scans for energy-intensive patterns
3. **Estimate** - Get instant energy/CO₂ estimates based on heuristics
4. **Optimize** - Receive AI-powered recommendations

## 📊 Metrics Explained

| Metric       | Description                      |
| ------------ | -------------------------------- |
| Energy (kWh) | Estimated energy consumption     |
| CO₂ (gCO2e)  | Estimated carbon footprint       |
| Complexity   | Code complexity factor (1.0-3.0) |
| Score (1-10) | Overall energy efficiency rating |

## 🌱 Why Green Software?

- Tech accounts for **2-4% of global emissions**
- Software energy use is growing **9% annually**
- Efficient code = fewer servers = less cooling = lower impact

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source under the MIT License.

## 👤 Author

**Govinda** - [GitHub](https://github.com/Govinda2809)

---

<p align="center">
  Made with 💚 for the planet
</p>
As tech’s environmental footprint grows, efficient and sustainable code helps reduce emissions and energy cost.
