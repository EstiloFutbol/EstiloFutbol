# Estilo Futbol - Deployment Guide

🌐 **Live Demo**: [https://estilo-futbol.vercel.app/](https://estilo-futbol.vercel.app/)

## Deployment Options

### 1. Vercel (Recommended)

The application is currently deployed on Vercel and configured for seamless deployment using the included `vercel.json` configuration.

#### Web Interface Deployment (Recommended)

1. **Prerequisites**:
   - A [Vercel](https://vercel.com) account
   - Your code pushed to a GitHub repository

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
   - Click "New Project" and import your GitHub repository

3. **Configure the Project**:
   - **Framework Preset**: Select "Other" (the project uses a custom FastAPI backend with vanilla JavaScript frontend)
   - **Root Directory**: Leave as default (root)
   - **Build Command**: Leave empty (not needed for this setup)
   - **Output Directory**: Leave empty
   - **Install Command**: Leave as default

4. **Deploy**:
   - Click "Deploy" and Vercel will automatically build and deploy your application
   - The deployment process typically takes 1-2 minutes

5. **Access Your Application**:
   - Once deployed, your application will be available at a URL like `https://your-project-name.vercel.app/`

#### CLI Deployment (Alternative)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel
   ```

#### Current Vercel Configuration

The project includes a `vercel.json` file with the following configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/frontend/**",
      "use": "@vercel/static"
    },
    {
      "src": "src/backend/app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/backend/app/main.py"
    },
    {
      "src": "/(.*\\.(css|js|png|jpg|jpeg|gif|svg|ico))",
      "dest": "src/frontend/$1"
    },
    {
      "src": "/(.*)",
      "dest": "src/frontend/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

This configuration:
- Serves static frontend files (HTML, CSS, JS) using `@vercel/static`
- Runs the FastAPI backend using `@vercel/python`
- Routes API calls to `/api/*` to the backend
- Routes static assets to the frontend directory
- Routes all other requests to the main HTML file
- Includes CORS headers for API endpoints
```

### 2. Heroku (For Full Flask App)

#### Setup
1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: python src/app.py
   ```

3. Create `runtime.txt`:
   ```
   python-3.9.18
   ```

4. Deploy:
   ```bash
   git init
   heroku create your-app-name
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

### 3. GitHub Pages (Static Only)

#### Setup
1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## Database Deployment

## Environment Variables

### Required Variables

### Optional Variables

## Performance Optimization

## Monitoring and Analytics

### 1. Add Google Analytics
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### 2. Error Tracking with Sentry
```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
)
```

### 3. Uptime Monitoring
- Use services like UptimeRobot
- Set up health check endpoints
- Monitor application response times
- Monitor database performance

## Security Considerations

### 1. HTTPS Only
```python
from flask_talisman import Talisman

Talisman(app, force_https=True)
```

### 2. Rate Limiting
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
```

### 3. CORS Configuration
```python
from flask_cors import CORS

CORS(app, origins=['https://yourdomain.com'])
```

## Backup and Recovery

### 1. Database Backups
- Set up automated backups
- Store in multiple locations
- Test restore procedures

### 2. Code Backups
- Use Git with multiple remotes
- Regular commits and tags
- Automated deployment rollbacks

## Scaling Considerations

### 1. Load Balancing
- Use services like Cloudflare
- Implement multiple server instances
- Database connection pooling

### 2. CDN Integration
- Serve static assets via CDN
- Cache static content
- Geographic distribution

### 3. Database Optimization
- Index frequently queried fields
- Implement query caching
- Consider read replicas for high traffic
- Optimize SQLite performance

## Maintenance

### 1. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging

### 2. Log Management
- Centralized logging
- Log rotation
- Error alerting

### 3. Performance Monitoring
- Track response times
- Monitor resource usage
- Set up alerts for issues