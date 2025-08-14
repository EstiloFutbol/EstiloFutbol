# Setup Guide

This guide provides detailed instructions for setting up the Estilo Futbol application for local development.

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

### 4. Environment Variables (Optional)

Create a `.env` file in the project root directory for environment variables:

```
# .env

# API configuration
API_V1_STR=/api
PROJECT_NAME=Estilo Futbol

# StatsBomb API configuration (for future use with private API)
STATSBOMB_USE_PRIVATE_API=false
STATSBOMB_API_KEY=
STATSBOMB_API_URL=

# CORS settings
BACKEND_CORS_ORIGINS=["http://localhost", "http://localhost:8000"]
```

### 5. Run the Backend Server

Start the FastAPI server:

```bash
# From the project root directory
python -m src.backend.app.main
```

The API will be available at `http://localhost:8000`. You can access the API documentation at `http://localhost:8000/docs`.

## Frontend Setup

The frontend is built with plain HTML, CSS, and JavaScript, so it doesn't require a build step.

### 1. Serve the Frontend Files

You can serve the frontend files using Python's built-in HTTP server:

```bash
# From the project root directory
python -m http.server --directory src/frontend
```

This will serve the frontend at `http://localhost:8000`. If this port is already in use (e.g., by the backend server), you can specify a different port:

```bash
python -m http.server 8080 --directory src/frontend
```

Alternatively, you can simply open the `src/frontend/index.html` file directly in your web browser.

### 2. Configure API URL

If your backend API is running on a different port or host, you'll need to update the API base URL in the frontend code.

Open `src/frontend/js/main.js` and modify the `API_BASE_URL` constant:

```javascript
// Change this to match your backend API URL
const API_BASE_URL = 'http://localhost:8000/api';
```

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

1. Open your browser and navigate to the frontend URL (e.g., `http://localhost:8080`)
2. You should see the Estilo Futbol application interface
3. The application should be able to fetch data from the backend API

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