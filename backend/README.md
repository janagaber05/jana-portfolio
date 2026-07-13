# Jana Portfolio CMS Backend

Express API + admin dashboard to control all portfolio content.

## Quick start

**Important:** `backend` is a sibling folder of `my-app`, not inside it.

```bash
# From the portfolio root (jana personal portoflio /)
cd backend
npm install
npm run dashboard:build
npm start
```

Or from inside `my-app`:

```bash
npm run backend
```

- **API:** http://localhost:5001/api/content
- **Dashboard:** http://localhost:5001/admin
- **Default password:** `jana-admin-2026` (set `ADMIN_PASSWORD` in `.env`)

## Frontend

In `my-app`, create `.env`:

```
REACT_APP_API_URL=http://localhost:5001
```

Then run the React app (`npm start`). It loads content from the API and falls back to `cms-default.json` if the API is offline.

## Dashboard sections

| Section | Controls |
|---------|----------|
| Hero | Load screen, nav, strips, portrait images, UI chrome |
| Featured Work | All 6 project cards + link to full case study editor |
| About | Headline, bio, stats, CTAs, photo |
| Disciplines | UX/UI and Graphic panels, skills, links |
| Process | Header + 4 process cards |
| Contact | Marquee, headline, email, socials, footer |
| Case study | Per-project: overview, research, quote, outcomes, image labels |
| Media | Upload images, copy URLs into any image field |

## Case study images

Place images in `my-app/public/case-studies/{project-slug}/`:

- `process-low.jpg`, `process-mid.jpg`, `process-high.jpg`
- `final-home.jpg`, `final-detail.jpg`, `final-checkout.jpg`

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/content` | No | Full site JSON |
| PUT | `/api/content` | Yes | Replace entire site |
| PUT | `/api/content/:section` | Yes | Update one section |
| POST | `/api/auth/login` | No | Get JWT token |
| POST | `/api/upload` | Yes | Upload image |

Data is stored in `backend/data/site.json`.

## Development

```bash
# Terminal 1 — API
npm run dev

# Terminal 2 — Dashboard hot reload
npm run dashboard:dev

# Terminal 3 — Portfolio
cd ../my-app && npm start
```

Dashboard dev server: http://localhost:5173/admin (proxies API to :5001)
