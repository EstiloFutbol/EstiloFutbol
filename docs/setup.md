# Setup Guide

This guide provides detailed instructions for setting up the Estilo Futbol application for local development.

🌐 **Live Demo**: [https://estilo-futbol.vercel.app/](https://estilo-futbol.vercel.app/)

> **Note**: You can try the live application before setting up locally. This guide is for developers who want to contribute or run the application locally.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Python 3.8 or higher
- Git
- A text editor or IDE (VS Code, PyCharm, etc.)

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/estilo-futbol.git
cd estilo-futbol
```

### 2. Create a Python Virtual Environment

It's recommended to use a virtual environment to isolate the project dependencies.

#### On Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

#### On macOS/Linux:

```bash
python -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the beginning of your command prompt, indicating that the virtual environment is active.

### 3. Install Dependencies

Install the required Python packages:

```bash
pip install -r src/backend/requirements.txt
```

**Note**: If you encounter any issues with static file serving, you may need to install additional dependencies:

```bash
pip install aiofiles
```

The application now includes enhanced static file serving capabilities for better frontend integration.

### 4. Environment Variables (Required for Security)

Create a `.env` file in the project root directory for environment variables. This is now **required** for the authentication system:

```
# .env

# Security Configuration (REQUIRED)
SECRET_KEY=your-very-long-random-secret-key-here
API_KEY=your-secure-api-key-here

# Admin Credentials (REQUIRED)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here

# API configuration
API_V1_STR=/api
PROJECT_NAME=Estilo Futbol

# StatsBomb API configuration (for future use with private API)
STATSBOMB_USE_PRIVATE_API=false
STATSBOMB_API_KEY=
STATSBOMB_API_URL=

# CORS settings
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8080", "https://estilo-futbol.vercel.app"]
```

#### Generating Secure Keys

For security, generate random keys using Python:

**Secret Key (for JWT signing):**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**API Key:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(24))"
```

**Important Security Notes:**
- Never commit your `.env` file to version control
- Use strong, unique passwords for production
- Change default credentials before deploying
- The `.env.example` file shows the required format without sensitive values

### 5. Run the Application

Start the FastAPI server (which now serves both the backend API and frontend):

```bash
# From the project root directory
python -m src.backend.app.main
```

The application will be available at `http://localhost:8000`. The API documentation is accessible at `http://localhost:8000/docs`.

**Note**: The backend now serves the frontend files directly, so you only need to run one server instead of separate frontend and backend servers.

## Frontend Configuration

The frontend is built with plain HTML, CSS, and JavaScript. No build step is required as the backend serves the static files directly from the `src/frontend` directory.

### API Configuration

The frontend is pre-configured to work with the backend API. The API base URL is set in `src/frontend/js/main.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

If you need to change the backend URL (e.g., for production deployment), update this constant accordingly.

## Running Both Frontend and Backend

For the best development experience, you'll want to run both the frontend and backend servers simultaneously.

### Option 1: Using Two Terminal Windows

1. In the first terminal, start the backend server:

```bash
python -m src.backend.app.main
```

2. In the second terminal, serve the frontend files:

```bash
python -m http.server 8080 --directory src/frontend
```

### Option 2: Using a Process Manager

You can use tools like `concurrently` (Node.js) to run both servers with a single command. This requires Node.js to be installed.

1. Install `concurrently` globally:

```bash
npm install -g concurrently
```

2. Create a `start.js` file in the project root:

```javascript
const { spawn } = require('child_process');
const path = require('path');

// Start backend
const backend = spawn('python', ['-m', 'src.backend.app.main'], {
  stdio: 'inherit',
});

// Start frontend
const frontend = spawn('python', ['-m', 'http.server', '8080', '--directory', 'src/frontend'], {
  stdio: 'inherit',
});

// Handle process termination
process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
```

3. Run both servers:

```bash
node start.js
```

## Verifying the Setup

To verify that everything is working correctly:

1. Open your browser and navigate to `http://localhost:8000` (the backend now serves the frontend directly)
2. You should see the Estilo Futbol application interface with all features working
3. The application should be able to fetch data from the backend API
4. Test the new player heat map functionality in the Statistics tab

### New Features Available

The application now includes:

- **Player Heat Maps**: Interactive visualization of player positioning data
- **Enhanced Statistics**: Expanded analytics capabilities
- **Improved UI**: Better responsive design and user experience
- **Static File Serving**: Frontend is now served directly by the FastAPI backend

### Testing the Backend Health Check

You can verify the backend is running correctly by accessing the health check endpoint:

```bash
curl http://localhost:8000/ping
```

You should receive the following response:

```json
{"status":"ok"}
```

Alternatively, you can open `http://localhost:8000/ping` in your browser.

### Testing Player Heat Maps

To test the new player heat map functionality:

1. Navigate to the Statistics tab
2. Select "Player Heat Maps" from the category dropdown
3. Choose a competition and season (data will load automatically)
4. Select a player from the dropdown
5. View the interactive heat map visualization on the football pitch

If you encounter any issues, check the browser console and the terminal running the backend server for error messages.

## Troubleshooting

### CORS Issues

If you see CORS-related errors in the browser console, ensure that the frontend's origin is included in the `BACKEND_CORS_ORIGINS` setting in the backend configuration.

### Module Not Found Errors

If you encounter "Module not found" errors when running the backend, make sure you're running the commands from the project root directory and that the virtual environment is activated.

### API Connection Issues

If the frontend can't connect to the backend API, check that:

1. The backend server is running
2. The `API_BASE_URL` in the frontend code is correct
3. There are no network restrictions blocking the connection

## Running Tests

The project includes a test suite to ensure everything is working correctly. To run the tests:

```bash
# From the project root directory with the virtual environment activated
pytest src/backend/tests/
```

To run tests with coverage reporting:

```bash
pytest --cov=src.backend src/backend/tests/
```

### Testing the Health Check Endpoint

The test suite includes a test for the health check endpoint (`/ping`). You can run this specific test with:

```bash
pytest src/backend/tests/test_api.py::test_health_check -v
```

## Next Steps

Now that you have the application running locally, you can:

- Explore the API documentation at `http://localhost:8000/docs`
- Make changes to the code and see them reflected in real-time
- Run the tests to ensure everything is working correctly

For information on deploying the application, see the [Deployment Guide](deployment.md).