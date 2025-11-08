# Event Service Frontend

Next.js + React + TypeScript frontend application

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL if backend is not on localhost:3001

# Run development server
npm run dev
```

Visit http://localhost:3000

## 🧪 Testing
```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:ui       # Visual test UI
```

## 📦 Build
```bash
npm run build  # Build for production
npm start      # Run production server
```

## 🏗️ Architecture

**Atomic Design:**
- **Atoms**: Button, Input, Badge, Spinner
- **Molecules**: FormField, StatusBadge, EventMeta, DateRangePicker
- **Organisms**: EventCard, EventForm, FilterPanel, EventList
- **Templates**: EventDashboard

**Features:**
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Admin and Public views
- ✅ Real-time AI summary streaming (SSE)
- ✅ Advanced filtering and pagination
- ✅ Form validation with error handling
- ✅ Loading states and empty states