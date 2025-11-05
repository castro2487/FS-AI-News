# Deployment Guide

Comprehensive guide for deploying the Event Service application to various platforms.

## Pre-Deployment Checklist

- [ ] All tests passing (backend and frontend)
- [ ] Environment variables configured
- [ ] API URL updated for production
- [ ] Security tokens changed from defaults
- [ ] Database/storage configured (if not using in-memory)
- [ ] Monitoring and logging setup

## Environment Variables

### Backend (.env)
```bash
PORT=3001
NODE_ENV=production
AUTH_TOKEN=your-secure-token-here  # Change from default!
```

### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Deployment Options

### Option 1: AWS (Recommended for Production)

#### Backend on AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize EB:
```bash
cd server
eb init -p node.js event-service-api
```

3. Create environment:
```bash
eb create event-service-prod
```

4. Set environment variables:
```bash
eb setenv PORT=3001 NODE_ENV=production AUTH_TOKEN=your-secure-token
```

5. Deploy:
```bash
eb deploy
```

6. Get URL:
```bash
eb status
```

#### Frontend on Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy from client directory:
```bash
cd client
vercel
```

3. Set environment variable in Vercel dashboard:
   - Go to project settings
   - Add `NEXT_PUBLIC_API_URL` with your EB backend URL

4. Deploy to production:
```bash
vercel --prod
```

### Option 2: Railway (Easiest)

#### Backend

1. Create account at railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Configure:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables in Railway dashboard
6. Deploy automatically triggers

#### Frontend

1. New Project → Deploy from GitHub
2. Select your repository
3. Configure:
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variable `NEXT_PUBLIC_API_URL`
5. Deploy

### Option 3: DigitalOcean App Platform

#### Backend

1. Create DigitalOcean account
2. Apps → Create App → GitHub
3. Select repository and branch
4. Configure app:
   ```yaml
   name: event-service-api
   services:
   - name: api
     source_dir: /server
     build_command: npm install && npm run build
     run_command: npm start
     envs:
     - key: PORT
       value: "3001"
     - key: NODE_ENV
       value: production
   ```

#### Frontend

1. Add component to same app:
   ```yaml
   - name: web
     source_dir: /client
     build_command: npm install && npm run build
     run_command: npm start
     envs:
     - key: NEXT_PUBLIC_API_URL
       value: ${api.PUBLIC_URL}
   ```

### Option 4: Heroku

#### Backend

1. Create Heroku app:
```bash
cd server
heroku create event-service-api
```

2. Add Procfile:
```
web: npm start
```

3. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set AUTH_TOKEN=your-secure-token
```

4. Deploy:
```bash
git subtree push --prefix server heroku main
```

#### Frontend

1. Create Heroku app:
```bash
cd client
heroku create event-service-web
```

2. Set environment:
```bash
heroku config:set NEXT_PUBLIC_API_URL=https://event-service-api.herokuapp.com
```

3. Deploy:
```bash
git subtree push --prefix client heroku main
```

### Option 5: Docker Deployment

#### Build Images

Backend Dockerfile (server/Dockerfile):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

Frontend Dockerfile (client/Dockerfile):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

docker-compose.yml (root):
```yaml
version: '3.8'
services:
  api:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - AUTH_TOKEN=your-secure-token
  
  web:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on:
      - api
```

Deploy:
```bash
docker-compose up -d
```

### Option 6: VPS (Ubuntu)

#### Setup Server

1. SSH into server:
```bash
ssh user@your-server-ip
```

2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Install PM2:
```bash
sudo npm install -g pm2
```

4. Clone repository:
```bash
git clone your-repo-url
cd event-service
```

#### Deploy Backend

```bash
cd server
npm install
npm run build

# Create PM2 config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'event-api',
    script: 'dist/index.js',
    env: {
      PORT: 3001,
      NODE_ENV: 'production'
    }
  }]
}
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Deploy Frontend

```bash
cd client
npm install
npm run build

# Create PM2 config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'event-web',
    script: 'npm',
    args: 'start',
    env: {
      NEXT_PUBLIC_API_URL: 'http://your-server-ip:3001'
    }
  }]
}
EOF

pm2 start ecosystem.config.js
pm2 save
```

#### Setup Nginx Reverse Proxy

```bash
sudo apt install nginx

# Backend config
sudo nano /etc/nginx/sites-available/api
```

Add:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Frontend config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Database Migration (From In-Memory to Persistent)

### AWS DynamoDB

1. Install AWS SDK:
```bash
cd server
npm install aws-sdk
```

2. Update EventStore.ts:
```typescript
import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Replace Map operations with DynamoDB operations
async create(event: Event) {
  await dynamodb.put({
    TableName: 'Events',
    Item: event
  }).promise();
  return event;
}
```

3. Create DynamoDB table via AWS Console or CLI

### PostgreSQL

1. Install dependencies:
```bash
npm install pg
```

2. Create database schema:
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  internal_notes TEXT,
  created_by VARCHAR(255),
  updated_at TIMESTAMP NOT NULL
);
```

3. Update EventStore implementation

## Security Checklist

- [ ] Change default auth token
- [ ] Use HTTPS in production
- [ ] Enable CORS only for trusted domains
- [ ] Add rate limiting
- [ ] Implement request validation
- [ ] Enable security headers
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Database backups configured
- [ ] Environment variables secured

## Monitoring

### Add Health Check Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- AWS CloudWatch
- Datadog

Monitor:
- `/health` endpoint
- Response times
- Error rates
- Server resources

### Logging

Add structured logging:
```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Performance Optimization

### Backend
- Enable gzip compression
- Add caching headers
- Implement connection pooling (if using DB)
- Use CDN for static assets

### Frontend
- Enable Next.js image optimization
- Implement code splitting
- Add service worker for PWA
- Use CDN for deployment

## Troubleshooting

### Backend won't start
- Check PORT not in use: `lsof -i :3001`
- Verify environment variables
- Check logs: `pm2 logs` or `heroku logs`

### Frontend can't reach backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS configuration
- Test API directly with curl

### SSE not working
- Ensure proxy doesn't buffer SSE
- Check nginx configuration
- Verify Content-Type header

## Rollback Strategy

1. Keep previous version tagged:
```bash
git tag v1.0.0
```

2. Quick rollback:
```bash
git revert HEAD
git push
```

3. Platform-specific:
- Heroku: `heroku rollback`
- Railway: Use deployment history
- Vercel: Select previous deployment

## Support

For deployment issues:
1. Check platform status pages
2. Review deployment logs
3. Test locally first
4. Contact platform support

## Cost Estimates

- **Railway**: Free tier available, ~$5-10/month for production
- **Heroku**: ~$7-14/month (2 dynos)
- **DigitalOcean**: ~$12-24/month (2 apps)
- **AWS**: Variable, ~$15-30/month (EB + RDS)
- **Vercel**: Free for frontend
- **VPS**: ~$5-10/month (basic droplet)
