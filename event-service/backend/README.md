# Event Service Backend

Node.js + Express + TypeScript + PostgreSQL backend API

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma db push
npm run db:seed

# Run development server
npm run dev
```

Server runs on http://localhost:3001

## 📡 API Endpoints

### Admin Endpoints (Require `Authorization: Bearer admin-token-123`)

**POST /events**
```bash
curl -X POST http://localhost:3001/events \
  -H "Authorization: Bearer admin-token-123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Event",
    "startAt": "2025-12-20T10:00:00Z",
    "endAt": "2025-12-20T12:00:00Z",
    "location": "New York",
    "status": "DRAFT"
  }'
```

**GET /events?dateFrom=2025-11-01&status=PUBLISHED&page=1&limit=20**
```bash
curl "http://localhost:3001/events?status=PUBLISHED" \
  -H "Authorization: Bearer admin-token-123"
```

**PATCH /events/:id**
```bash
curl -X PATCH http://localhost:3001/events/evt-123 \
  -H "Authorization: Bearer admin-token-123" \
  -H "Content-Type: application/json" \
  -d '{"status": "PUBLISHED"}'
```

### Public Endpoints (No auth required)

**GET /public/events**
```bash
curl "http://localhost:3001/public/events?locations=New%20York"
```

**GET /public/events/:id/summary** (SSE stream)
```bash
curl "http://localhost:3001/public/events/evt-123/summary"
```

## 🧪 Testing
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📦 Build
```bash
npm run build  # Compile TypeScript
npm start      # Run production server
```