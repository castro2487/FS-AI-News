# Event Service

A comprehensive full-stack Event Management System with Node.js/TypeScript backend and Next.js React frontend. This application demonstrates production-ready architecture with authentication, real-time AI summaries via Server-Sent Events, and comprehensive testing.

## Features

### Backend
- RESTful API with Express and TypeScript
- Bearer token authentication
- Event CRUD operations with validation
- Status workflow management (DRAFT → PUBLISHED → CANCELLED)
- Server-Sent Events for real-time AI summary streaming
- In-memory caching with intelligent invalidation
- Comprehensive test suite with high coverage

### Frontend
- Modern Next.js React application with TypeScript
- Responsive mobile-first design
- Admin dashboard for event management
- Public interface for browsing events
- Real-time AI summary generation with streaming
- Filtering and pagination
- Complete authentication flow

## Project Structure

```
event-service/
├── server/                 # Backend API
│   ├── src/
│   │   ├── models/        # Data models and validation
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth and error handling
│   │   ├── services/      # Business logic
│   │   └── tests/         # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── client/                 # Frontend React app
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   ├── lib/               # API client and types
│   ├── tests/             # Frontend tests
│   ├── package.json
│   └── tsconfig.json
└── docs/                   # Documentation
    ├── API.md
    └── DEPLOYMENT.md
```

## Prerequisites

- Node.js 18+ and npm/pnpm
- Git

## Local Development Setup

### 1. Clone or Download

```bash
git clone <your-repo-url>
cd event-service
```

### 2. Backend Setup

```bash
cd server
npm install

# Run tests
npm test

# Start development server
npm run dev
```

The backend API will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd client
npm install

# Run tests
npm test

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Quick Start

1. Start the backend server (terminal 1):
   ```bash
   cd server && npm run dev
   ```

2. Start the frontend app (terminal 2):
   ```bash
   cd client && npm run dev
   ```

3. Open browser to:
   - Public Events: `http://localhost:3000`
   - Admin Dashboard: `http://localhost:3000/admin`

4. Login to admin with token: `admin-token-123`

## Usage Examples

### Admin Dashboard
1. Login with token `admin-token-123`
2. Create new events with title, dates, location
3. Manage event status (Draft → Published → Cancelled)
4. Add internal notes and track creator
5. Filter events by status and location

### Public Interface
1. Browse published and cancelled events
2. Filter by location
3. Click "AI Summary" to see real-time generated summary
4. View event details and upcoming status

## API Examples

See <filepath>docs/API.md</filepath> for complete API documentation including:
- Authentication
- All endpoints with examples
- Error handling
- Query parameters
- Response formats

## Testing

### Backend Tests
```bash
cd server
npm test              # Run all tests
npm test -- --coverage   # With coverage report
```

### Frontend Tests
```bash
cd client
npm test              # Run all tests
npm test -- --coverage   # With coverage report
```

## Environment Variables

### Backend (.env)
```
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Deployment

See <filepath>docs/DEPLOYMENT.md</filepath> for detailed deployment instructions to:
- AWS (EC2, ECS, Elastic Beanstalk)
- Vercel (Frontend)
- Heroku
- Railway
- DigitalOcean

## Technology Stack

### Backend
- Node.js + Express
- TypeScript
- Jest + Supertest (testing)
- UUID (ID generation)
- In-memory storage (easily replaceable with AWS DynamoDB/RDS)

### Frontend
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Jest + React Testing Library

## Key Features Explained

### Event Status Workflow
- **DRAFT**: Initial state, editable
- **PUBLISHED**: Visible to public, can only transition to CANCELLED
- **CANCELLED**: Terminal state, no further modifications

### AI Summary Generation
- Deterministic summary based on event details
- Streamed in real-time via Server-Sent Events
- Cached based on event content hash
- Cache headers indicate HIT/MISS status

### Authentication
- Simple bearer token authentication
- Token: `admin-token-123`
- Stored in localStorage
- Protected routes require valid token

## Development Notes

### In-Memory Storage
Current implementation uses in-memory Map for storage. To switch to persistent storage:

1. Replace EventStore implementation
2. Keep the same interface
3. Update to use AWS SDK for DynamoDB or connect to PostgreSQL

### Notification Service
Mock implementation logs to console. To integrate with AWS:

```typescript
// In NotificationService.ts
import AWS from 'aws-sdk';
const sns = new AWS.SNS();
// Send real notifications
```

## License

MIT

## Author

MiniMax Agent

## Support

For issues and questions, please create an issue in the repository.
