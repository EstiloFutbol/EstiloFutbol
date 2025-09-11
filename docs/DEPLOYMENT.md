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
      "src": "/(.*)",
      "dest": "src/backend/app/main.py"
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

**Key Changes in Current Configuration:**

- **Simplified Build Process**: Only the FastAPI backend is built, as it now serves the frontend directly
- **Unified Routing**: All requests are routed to the FastAPI application, which handles both API endpoints and static file serving
- **Static File Integration**: The backend serves frontend files directly using FastAPI's StaticFiles middleware
- **Enhanced Performance**: Reduced complexity and improved loading times by eliminating separate frontend/backend coordination
  ]
}
```

This configuration provides:

- **Simplified Architecture**: Single FastAPI application handles both API and static file serving
- **Unified Deployment**: Only one build process needed instead of separate frontend/backend builds
- **Better Performance**: Reduced latency by eliminating cross-origin requests between frontend and backend
- **Easier Maintenance**: Single codebase deployment with consistent routing
- **Enhanced Security**: No CORS issues since everything is served from the same origin

#### Dependencies and Requirements

The deployment now requires the following additional dependencies:

```txt
# Core FastAPI dependencies
fastapi>=0.68.0,<0.69.0
uvicorn>=0.15.0,<0.16.0
pydantic>=1.8.0,<2.0.0

# StatsBomb data integration
statsbombpy>=1.10.0

# Environment and configuration
python-dotenv>=0.19.0
requests>=2.26.0
python-multipart>=0.0.5

# Static file serving (NEW)
aiofiles

# Authentication dependencies
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
bcrypt>=3.2.0

# Testing
pytest>=7.0.0
pytest-cov>=4.0.0
```

**Note**: The `aiofiles` dependency is crucial for proper static file serving in the FastAPI application.
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

### Required Variables for Production

For security, you **must** configure the following environment variables in your deployment platform:

#### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:

```
SECRET_KEY=your-production-secret-key-here
API_KEY=your-production-api-key-here
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-admin-password
BACKEND_CORS_ORIGINS=["https://your-domain.vercel.app"]
```

#### Generating Secure Production Keys

Use these commands to generate secure keys for production:

```bash
# Generate a 32-character secret key for JWT signing
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate a 24-character API key
python -c "import secrets; print(secrets.token_urlsafe(24))"
```

#### Security Best Practices

- **Never use default credentials in production**
- **Use strong, unique passwords with mixed case, numbers, and symbols**
- **Generate long, random secret keys (minimum 32 characters)**
- **Store sensitive data only in environment variables, never in code**
- **Regularly rotate API keys and passwords**

### Optional Variables

These variables can be configured for additional functionality:

```
API_V1_STR=/api
PROJECT_NAME=Estilo Futbol
STATSBOMB_USE_PRIVATE_API=false
STATSBOMB_API_KEY=your-statsbomb-private-key
STATSBOMB_API_URL=https://api.statsbomb.com
```

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