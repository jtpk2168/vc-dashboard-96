# SaaS Sales Dashboard

A modern, clean, and responsive sales dashboard built with React, Vite, and Tailwind CSS. This dashboard dynamically loads data from a CSV file and provides key performance indicators (KPIs) and a detailed data view.

## ✨ Features

- **Dark Mode Support**: Toggle between sleek High-Contrast and Dark themes with persistent user preference.
- **Interactive Visualizations**: 
  - Revenue Trend (Area Chart)
  - Channel Split (Donut Chart)
  - Product Leaderboard (Bar Chart)
- **Advanced Filtering**: Filter by Product, Acquisition Channel, and Date Range.
- **Dynamic Data Loading**: Fetches and parses sales data from `/public/data/sales_data.csv`.
- **KPI Overview**: Real-time calculation of Revenue, Orders, Profit, and AOV.
- **Premium Aesthetics**: Built with a sleek SaaS design system using Slate and Indigo color palettes.

## 🚀 Technology Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **CSV Parsing**: [Papa Parse](https://www.papaparse.com/)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

**Deploying to Vercel?** Be sure to read the [production.md](./production.md) file for a quick 4-step deployment guide.

### 🤖 AI Setup

To use the **Gemini Strategic Insights** feature:
1. Create a `.env` file referencing `.env.example`.
2. Add your Google Gemini API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
   ```

### 🗄️ Database Setup (Supabase)

The backend API (`/api/sales`) reads from the local CSV by default but connects seamlessly to **Supabase**. See [production.md](./production.md) or above for deployment credentials.

## 📂 Project Structure

```text
vc-dashboard/
├── app/
│   ├── api/sales/      # Next.js API Routes (Serverless)
│   ├── globals.css     # Tailwind & Globals
│   ├── layout.jsx      # Next.js Root Layout
│   └── page.jsx        # Main Dashboard Page
├── lib/
│   └── dataService.js   # Data Fetching Layer (CSV + Supabase)
├── public/
│   └── data/           # Local CSV Data source
├── .env.example        # Environment variable template
├── next.config.mjs     # Next.js configuration
├── tailwind.config.js  # Tailwind configuration
└── production.md       # Vercel Deployment Instructions
```

## 📊 Data Format

The dashboard expects a CSV file at `public/data/sales_data.csv` with the following columns:
`date, product, channel, orders, revenue, cost, visitors, customers`
