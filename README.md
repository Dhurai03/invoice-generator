# InvoiceForge — MERN Stack Invoice Generator

A full-stack, professional invoice generator built with MongoDB, Express.js, React + Vite, and Node.js.

## Features

- 📄 Upload existing invoice templates (PDF/Image/HTML)
- ✏️ Create custom templates from scratch with a visual builder
- 📊 Generate invoices with dynamic data (client, items, pricing, tax, discount)
- 👁️ Live preview as you fill in the form
- ⬇️ Download invoices as PDF (browser print)
- 🕐 View and manage invoice history
- 📈 Dashboard with revenue stats
- 🎨 Premium dark UI with glassmorphism

## Project Structure

```
invoice-generator/
├── client/          — React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── services/
└── server/          — Express + MongoDB backend
    └── src/
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        └── utils/
```

## Setup & Running

### 1. Backend Setup

```bash
cd server
cp .env.example .env
# Fill in your MongoDB and Cloudinary credentials in .env
npm install
npm run dev        # runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev        # runs on http://localhost:5173
```

### Environment Variables (server/.env)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLIENT_URL` | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Free Hosting

| Service | Purpose |
|---|---|
| [Vercel](https://vercel.com) | Frontend |
| [Render.com](https://render.com) | Backend API |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Database |
| [Cloudinary](https://cloudinary.com) | File storage |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/templates` | List templates |
| POST | `/api/templates` | Create template |
| POST | `/api/templates/upload` | Upload template file |
| DELETE | `/api/templates/:id` | Delete template |
| GET | `/api/invoices/stats` | Dashboard stats |
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| PATCH | `/api/invoices/:id/status` | Update status |
| DELETE | `/api/invoices/:id` | Delete invoice |
