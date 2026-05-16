# Contributions Scraper Web

A web app that scans academic PDFs for mentions of zoos and aquariums, then exports results to Excel. Built for the SEZARC research program.

**Live demo:** https://YOUR-SITE.netlify.app

---

## What It Does

- Upload academic PDFs through the browser
- Scans each PDF for matches against a customizable institution list
- Shows which zoos and aquariums are mentioned in each article
- Exports results to Excel in two formats (default and expanded)
- Lets users add, remove, import, or export the institution list

---

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Python + Flask
- **PDF Parsing:** PyMuPDF, pdfrw
- **Excel Export:** pandas + openpyxl
- **Hosting:** Netlify (frontend), Render (backend)

---

## Project Structure

```
Contributions-Scraper-Web/
├── backend_algorithm/              # Flask backend
│   ├── server.py                   # API routes and server entry point
│   ├── matcher.py                  # PDF text extraction and matching logic
│   ├── zoo_aquarium_list.txt       # Editable institution list
│   └── zoo_aquarium_list_default.txt  # Original default list
│
├── contributions_scraper_web/      # React frontend
│   └── src/
│       ├── App.jsx                 # Main app and shared state
│       ├── contributions_scraper.jsx   # Upload and results view
│       ├── exportSettingsModal.jsx # Excel export options
│       └── manageZooListModal.jsx  # Institution list editor
│
├── requirements.txt                # Python dependencies
├── package.json                    # Node dependencies
└── netlify.toml                    # Netlify build config
```

---

## Setup and Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm

### Backend Setup

```bash
cd backend_algorithm
pip install -r ../requirements.txt
```

### Frontend Setup

```bash
cd contributions_scraper_web
npm install
```

---

## Running Locally

You need both the backend and frontend running at the same time.

### Start the backend

```bash
cd backend_algorithm
python server.py
```

Runs on `http://localhost:5000`.

### Start the frontend (in a new terminal)

```bash
cd contributions_scraper_web
npm run dev
```

Runs on `http://localhost:5173`.

**Note:** The frontend currently has the production backend URL hardcoded. To run fully local, swap `https://contributions-scraper-api.onrender.com` for `http://localhost:5000` in the fetch calls.

---

## Deployment

### Backend (Render)

1. Push your code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Settings:
   - Root Directory: `backend_algorithm`
   - Build Command: `pip install -r ../requirements.txt`
   - Start Command: `gunicorn server:app`

### Frontend (Netlify)

1. Connect your repo on [Netlify](https://netlify.com)
2. The `netlify.toml` file in the repo root handles all build settings
3. Netlify auto deploys on every push to main

---

## Environment Variables

This project currently has no required environment variables. The backend URL is hardcoded in the frontend fetch calls.

**Recommended future change:** move backend URL to `VITE_API_URL` in a `.env` file:

```
VITE_API_URL=https://contributions-scraper-api.onrender.com
```

Never commit `.env` files. Add them to `.gitignore`.

---

## How It Works

1. User uploads PDFs in the React frontend
2. Frontend sends files to the Flask backend `/scrape` endpoint
3. `matcher.py` extracts text from each PDF using PyMuPDF
4. Text is normalized (lowercased, accents stripped, hyphenation fixed)
5. Each line is checked against the institution list using regex with word boundaries
6. Results return as JSON and display in the UI
7. User can export to Excel through the `/exportExcel` endpoint

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scrape` | Accepts uploaded PDFs, returns scan results as JSON |
| POST | `/exportExcel` | Builds an Excel file from results and returns it as a download |
| GET | `/institutions` | Returns the current institution list |
| POST | `/institutions` | Saves an updated institution list |
| GET | `/institutions/default` | Returns the original default institution list |

---

## Known Limitations

- Render free tier spins down after 15 minutes of inactivity, so the first request after idle takes 30 to 60 seconds
- Institution list edits do not persist long term on Render free tier (filesystem resets)
- PDF text extraction can miss text in image based or scanned PDFs
- Matcher does not yet handle OCR or complex multi line institution names
- No user accounts, the institution list is shared across all users

---

## Future Improvements

- Add caching so repeat PDF scans skip already processed files
- Multithread the matcher for faster bulk scanning
- Replace the flat text file institution list with a proper database
- Add automated tests for the matcher to catch false positives
- Add user accounts so each user has their own saved list

---

## Credits

Built by Nathan Wood for the SEZARC research program at the University of Delaware (CISC499).

Default institution list adapted from Leon's World Map of Parks, Zoos and Aquariums.