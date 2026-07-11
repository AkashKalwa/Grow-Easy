# GrowEasy AI CSV Lead Importer

An AI-powered, stateless, production-ready full-stack application that accepts CSV lead files of any layout (e.g. Google Ads, Facebook Ads, custom Excel sheets) and intelligently extracts and normalizes them into standard **GrowEasy CRM Leads** format using the Gemini API.

---

## 🚀 Key Features

*   **Sleek Dashboard UI**: Modern responsive design matching the GrowEasy CRM color palette and layout.
*   **Drag-and-Drop CSV Uploader**: Beautiful custom file picker with size (max 5MB) and format validations.
*   **Virtual Scroll Table**: Custom, zero-dependency virtual table that easily handles 10,000+ rows without performance lag.
*   **Gemini AI Lead Mapping**: Intelligently extracts, splits, and formats contacts, separating country codes and appending extra rows to notes dynamically.
*   **Robust Batch Processing & Fail-safes**: Automatically batches data, incorporates exponential backoff, and provides a front-end "Retry" option for failed batches.
*   **Stateless Architecture**: Zero database dependencies. Full operations flow directly between client browser, Express APIs, and Google AI Studio.
*   **Fully Tested**: Built-in unit tests using Node's native test runner for processing algorithms.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js (App Router, React 19, TypeScript, Tailwind CSS, Lucide React)
*   **Backend**: Node.js (Express, TypeScript, TSX, Dotenv)
*   **AI**: Gemini API (`gemini-2.5-flash` model, Schema Enforcement, JSON mode)
*   **Containerization**: Docker & Docker Compose

---

## ⚙️ Environment Variables

### Backend (`/backend/.env`)
Create a `.env` file in the `backend/` folder based on `backend/.env.example`:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSy... # Your Gemini API key from Google AI Studio
GEMINI_MODEL=gemini-2.5-flash
```

### Frontend (`/frontend/.env.local`)
Create a `.env.local` file in the `frontend/` folder based on `frontend/.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 💻 Local Development

### 1. Prerequisites
*   Node.js (v18+ recommended)
*   NPM (v9+ recommended)

### 2. Backend Setup
```bash
cd backend
# Install dependencies
npm install

# Run unit tests
npm test

# Start Express server in development mode (watches for changes)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Running with Docker

Orchestrate both frontend and backend automatically:

```bash
# 1. Fill in your Gemini API key in backend/.env or export it in your shell
export GEMINI_API_KEY=your_key_here

# 2. Build and start containers
docker-compose up --build
```
*   Frontend will be running on `http://localhost:3000`
*   Backend will be running on `http://localhost:5000`

---

## 📋 Evaluation Criteria & Schema Mapping

The AI maps columns from any layout structure to the GrowEasy schema:

```json
{
  "created_at": "JavaScript date convertible using new Date()",
  "name": "Full name",
  "email": "Primary email",
  "country_code": "Extracted country code, e.g. +91",
  "mobile_without_country_code": "Mobile number without country code",
  "company": "Company Name",
  "city": "City",
  "state": "State",
  "country": "Country",
  "lead_owner": "Default assignee/owner",
  "crm_status": "GOOD_LEAD_FOLLOW_UP | DID_NOT_CONNECT | BAD_LEAD | SALE_DONE | ''",
  "crm_note": "Includes remarks, comments, follow up notes, extra numbers/emails",
  "data_source": "leads_on_demand | meridian_tower | eden_park | varah_swamy | sarjapur_plots | ''",
  "possession_time": "Timeframe",
  "description": "Additional description info"
}
```

---

## 🛫 Deployment Instructions

### Frontend (Vercel)
1. Push your project code to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your repository.
4. Set the Root Directory to `frontend`.
5. Add the Environment Variable `NEXT_PUBLIC_API_URL` pointing to your deployed backend URL.
6. Click **Deploy**.

### Backend (Render / Railway)
1. Log into your hosting platform (e.g. Render).
2. Create a new **Web Service** and link your repository.
3. Set the Root Directory to `backend`.
4. Set the Build Command to `npm run build`.
5. Set the Start Command to `npm start`.
6. Add the following Environment Variables in the service settings:
    *   `PORT=5000`
    *   `GEMINI_API_KEY` (Your API Key)
    *   `FRONTEND_URL` (Your deployed Vercel frontend URL)
7. Click **Deploy**.
