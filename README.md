# Estilo Futbol

A modern web application for football analytics using StatsBomb open data.

![Estilo Futbol Logo](assets/Logo.png)

## Overview

Estilo Futbol is a football analytics platform that provides insights into competitions, matches, and team statistics. The application uses StatsBomb's open data API to fetch and display football data in an intuitive and user-friendly interface. As a technical documentation project, it demonstrates how to build a full-stack application with Python backend and plain HTML/CSS/JavaScript frontend.

## Tech Stack

### Backend
- **Python 3.8+**: Core programming language
- **FastAPI**: Modern, high-performance web framework
- **Pydantic**: Data validation and settings management
- **StatsBombPy**: Python wrapper for StatsBomb API
- **Uvicorn**: ASGI server for serving the API

### Frontend
- **HTML5**: Structure for web pages
- **CSS3**: Styling and responsive design
- **JavaScript (ES6+)**: Client-side functionality
- **No frameworks**: Pure vanilla implementation for simplicity

### Development & Deployment
- **Git**: Version control
- **GitHub Actions**: CI/CD pipeline
- **Vercel**: Deployment platform

## Features

- **Competition Selection**: Choose from available competitions and seasons
- **Match Results**: Browse matches by round with detailed information
- **Team Statistics**: View and compare team performance metrics
- **Responsive Design**: Works on desktop and mobile devices
- **API Documentation**: Comprehensive documentation of all endpoints
- **Future-proof Architecture**: Prepared for switching to StatsBomb private API

## Project Structure

```
EstiloFutbol/
│
├── src/
│   ├── backend/                     # Backend logic (Python API)
│   │   ├── app/                     # Main application package
│   │   │   ├── __init__.py
│   │   │   ├── main.py              # Entry point (FastAPI app)
│   │   │   ├── api/                 # API route definitions
│   │   │   │   ├── __init__.py
│   │   │   │   └── matches.py       # Match endpoints
│   │   │   ├── services/            # Logic layer (data fetching)
│   │   │   │   ├── __init__.py
│   │   │   │   └── statsbomb.py     # StatsBomb service
│   │   │   ├── models/              # Pydantic models
│   │   │   │   ├── __init__.py
│   │   │   │   └── match.py         # Match models
│   │   │   └── config.py            # Environment and API config
│   │   ├── tests/                   # Unit and integration tests
│   │   │   ├── __init__.py
│   │   │   └── test_api.py          # API tests
│   │   └── requirements.txt         # Python dependencies
│   │
│   └── frontend/                    # Frontend static files
│       ├── index.html               # Main HTML file
│       ├── css/                     # CSS styles
│       │   └── styles.css           # Main stylesheet
│       ├── js/                      # JavaScript files
│       │   └── main.js              # Main JavaScript file
│       └── assets/                  # Images, icons, etc.
│
├── docs/                            # Project documentation
│   ├── api.md                       # API endpoint documentation
│   ├── setup.md                     # Local setup instructions
│   ├── DEPLOYMENT.md                # Vercel deployment guide
│   ├── roadmap.md                   # Future plans and features
│   ├── CODE_INDEX.md                # Code structure overview
│   └── index.md                     # Documentation index
│
├── .github/                         # GitHub configuration
│   └── workflows/                   # GitHub Actions workflows
│       └── ci.yml                   # CI pipeline configuration
│
├── assets/                          # Global assets
│   └── Logo.png                     # Project logo
│
├── .gitignore                       # Git ignore file
├── README.md                        # Project overview (this file)
└── vercel.json                      # Vercel deployment config
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Git

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/estilo-futbol.git
cd estilo-futbol
```

2. Set up the Python virtual environment:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r src/backend/requirements.txt
```

3. Run the backend server:

```bash
# From the project root directory
python -m src.backend.app.main
```

The API will be available at `http://localhost:8000`. You can access the API documentation at `http://localhost:8000/docs`.

### Frontend Setup

The frontend is built with plain HTML, CSS, and JavaScript, so it doesn't require a build step.

1. Serve the frontend files using Python's built-in HTTP server:

```bash
# From the project root directory
python -m http.server --directory src/frontend 8080
```

This will serve the frontend at `http://localhost:8080`.

Alternatively, you can simply open the `src/frontend/index.html` file directly in your web browser.

## How to Run the Project

### Running Both Frontend and Backend

For the best development experience, you'll want to run both the frontend and backend servers simultaneously.

1. In the first terminal, start the backend server:

```bash
# Ensure your virtual environment is activated
python -m src.backend.app.main
```

2. In the second terminal, serve the frontend files:

```bash
python -m http.server 8080 --directory src/frontend
```

3. Open your browser and navigate to `http://localhost:8080`

## Documentation

For more detailed information, please refer to the following documentation:

- [API Documentation](docs/api.md): Detailed information about API endpoints, parameters, and response formats
- [Setup Guide](docs/setup.md): Comprehensive instructions for setting up the project locally
- [Deployment Guide](docs/DEPLOYMENT.md): Guide for deploying the application to Vercel
- [Roadmap](docs/roadmap.md): Planned features and enhancements

## How to Contribute

Contributions are welcome! Here's how you can contribute to the Estilo Futbol project:

1. **Fork the Repository**: Click the "Fork" button at the top right of the repository page

2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/your-username/estilo-futbol.git
   cd estilo-futbol
   ```

3. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes**: Implement your feature or bug fix

5. **Run Tests**: Ensure your changes don't break existing functionality
   ```bash
   python -m pytest src/backend/tests/
   ```

6. **Commit Your Changes**:
   ```bash
   git commit -m "Add feature: your feature description"
   ```

7. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**: Go to the original repository and click "New Pull Request"

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Include tests for new features or bug fixes
- Update documentation as needed
- Be respectful and constructive in discussions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [StatsBomb](https://statsbomb.com) for providing the open data
- All contributors who have helped shape this project