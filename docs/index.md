# Estilo Futbol Documentation

Welcome to the Estilo Futbol documentation. This guide provides comprehensive information about the project, its architecture, setup instructions, and more.

## Table of Contents

### Getting Started

- [Project Overview](../README.md) - Introduction to the project and its features
- [Setup Guide](setup.md) - Instructions for setting up the project locally
- [Deployment Guide](DEPLOYMENT.md) - Guide for deploying the application to production

### API Documentation

- [API Reference](api.md) - Detailed information about API endpoints

### Development

- [Code Index](CODE_INDEX.md) - Overview of the codebase structure
- [Roadmap](roadmap.md) - Planned features and enhancements

## Project Structure

The Estilo Futbol project follows a structured organization:

```
EstiloFutbol/
│
├── backend/                         # Backend logic (Python API)
│   ├── app/                         # Main application package
│   │   ├── __init__.py
│   │   ├── main.py                  # Entry point (FastAPI app)
│   │   ├── api/                     # API route definitions
│   │   ├── services/                # Logic layer (data fetching)
│   │   ├── models/                  # Pydantic models or schemas
│   │   └── config.py                # Environment and API config
│   ├── tests/                       # Unit and integration tests
│   └── requirements.txt             # Python dependencies
│
├── frontend/                        # Frontend static files
│   ├── index.html                   # Main HTML file
│   ├── css/                         # CSS styles
│   ├── js/                          # JavaScript files
│   └── assets/                      # Images, icons, etc.
│
├── docs/                            # Project documentation
│   ├── api.md                       # API endpoint documentation
│   ├── setup.md                     # Local setup instructions
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── roadmap.md                   # Future plans and features
│
├── .github/                         # GitHub configuration
│   └── workflows/                   # GitHub Actions workflows
│
├── .gitignore                       # Git ignore file
├── README.md                        # Project overview
└── vercel.json                      # Vercel deployment config
```

## Technology Stack

### Backend

- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Data Source**: StatsBomb open data (with future support for private API)

### Frontend

- **HTML/CSS/JavaScript**: Plain frontend without frameworks
- **Responsive Design**: Mobile-friendly interface

### Deployment

- **Hosting**: Vercel
- **CI/CD**: GitHub Actions

## Contributing

Contributions to the Estilo Futbol project are welcome! Please refer to the [README](../README.md) for information on how to contribute.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.