# 💰 SmartBudget — Personal Finance & Budget Web Application

A modern, responsive, full-featured **Personal Budget & Expense Tracking Web Application** built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**.

![SmartBudget App Banner](https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20TypeScript%20%7C%20TailwindCSS-blue?style=for-the-badge)

---

## 🎯 Core Features

1. **Dashboard Overview**:
   - Live metrics: Total Income, Total Expenses, Net Balance, and Savings Rate percentage.
   - Interactive Recharts visualizations: Expense Allocation Pie Chart and Monthly Income vs. Expense Bar Chart.
   - Quick Recent Activity feed with instant navigation.

2. **Transaction Ledger (Full CRUD)**:
   - Add, Edit, and Delete income and expense items.
   - Instant search filtering by description or notes.
   - Category filtering and Type filtering (Income / Expense).
   - Multi-field sorting (Date Newest/Oldest, Amount Highest/Lowest).

3. **Monthly Category Budgeting**:
   - Configurable monthly spending limits per category (Housing, Food, Utilities, Entertainment, etc.).
   - Visual progress bars with color-coded status indicators (Safe, Warning, Over Budget).
   - Real-time over-budget warnings and budget health summary cards.

4. **Data Persistence & Management**:
   - Zero database required! Data is stored automatically in browser `localStorage`.
   - Seeded default dataset on first load so the app looks complete out of the box.
   - One-click JSON backup export and backup import capabilities.
   - Instant data reset trigger.

5. **Theme Support & Responsive UI**:
   - Smooth Dark & Light theme toggling with custom CSS tokens.
   - Glassmorphic UI design system built for desktop, tablet, and mobile viewports.

---

## 🛠 Tech Stack

- **Framework**: React 18 + Vite (SPA)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Glassmorphism design system
- **Icons**: Lucide Icons (`lucide-react`)
- **Charts**: Recharts
- **Deployment**: Vercel

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## 📤 Push to GitHub & Deploy to Vercel

### Step 1: Push Code to GitHub Repository
Run the following commands in your terminal inside the project directory:

```bash
# 1. Initialize Git repository
git init

# 2. Stage all project files
git add .

# 3. Commit initial project code
git commit -m "Initial commit - Personal Budget App"

# 4. Link your remote GitHub repository
git remote add origin https://github.com/HHSloan/PersonalBudgetApp.git

# 5. Set main branch and push code
git branch -M main
git push -u origin main
```

### Step 2: Deploy Seamlessly to Vercel

#### Option A: Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
2. Select **"Import Git Repository"** and choose `HHSloan/PersonalBudgetApp`.
3. Vercel will automatically detect **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your app will be live with a production HTTPS URL in under 60 seconds!

#### Option B: Vercel CLI
If you have the Vercel CLI installed (`npm i -g vercel`), simply run:
```bash
vercel
```

---

## 📂 Project Directory Structure

```
├── .gitignore
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── budget.ts
    ├── utils/
    │   ├── formatters.ts
    │   ├── sampleData.ts
    │   └── storage.ts
    └── components/
        ├── Header.tsx
        ├── DashboardOverview.tsx
        ├── TransactionList.tsx
        ├── TransactionModal.tsx
        ├── BudgetManager.tsx
        └── AnalyticsView.tsx
```
