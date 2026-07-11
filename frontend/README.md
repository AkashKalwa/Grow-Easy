# GrowEasy Frontend

Next.js 16 (App Router) frontend for the GrowEasy AI CSV Lead Importer.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- Lucide React icons

## Setup

```bash
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Run

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Notes

- The backend must be running on port 5000 before importing CSVs.
- Dark mode is class-based (`dark` on `<html>`), persisted via `localStorage`.
- The virtualized `PreviewTable` handles 10,000+ row CSVs without lag.
