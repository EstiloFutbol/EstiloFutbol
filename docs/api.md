# API Documentation

## Overview

The Estilo Futbol API provides access to football data from StatsBomb. This document outlines the available endpoints, their parameters, and response formats.

## Base URL

When running locally, the API is available at:

```
http://localhost:8000/api
```

When deployed to Vercel, the API is available at:

```
https://estilo-futbol.vercel.app/api
```

🌐 **Live API**: [https://estilo-futbol.vercel.app/api](https://estilo-futbol.vercel.app/api)

**Interactive API Documentation**: [https://estilo-futbol.vercel.app/api/docs](https://estilo-futbol.vercel.app/api/docs)

## Authentication

The API now supports two authentication methods to secure access to football data:

### 1. API Key Authentication

For programmatic access, use an API key in the request header:

```bash
curl -H "X-API-Key: your-api-key-here" http://localhost:8000/api/competitions/
```

**PowerShell Example:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/competitions/" -Headers @{"X-API-Key"="your-api-key-here"}
```

### 2. JWT Token Authentication

For user-based authentication, obtain a JWT token by logging in:

#### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Using JWT Token

Include the token in the Authorization header:

```bash
curl -H "Authorization: Bearer your-jwt-token-here" http://localhost:8000/api/competitions/
```

**PowerShell Example:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/competitions/" -Headers @{"Authorization"="Bearer your-jwt-token-here"}
```

### Configuration

Authentication is configured via environment variables:

- `API_KEY`: The API key for programmatic access
- `SECRET_KEY`: JWT signing secret
- `ADMIN_USERNAME`: Admin username for login
- `ADMIN_PASSWORD`: Admin password for login

### Security Features

- JWT tokens expire after 30 minutes
- CORS is configured to allow specific origins
- All protected endpoints require either valid API key or JWT token
- Passwords are hashed using bcrypt

**Note:** The API is prepared for future integration with StatsBomb's private API, which will require additional authentication configuration.

## Endpoints

### Health Check

#### Ping

```
GET /ping
```

A simple health check endpoint to verify the API is running.

**Response Example:**

```json
{
  "status": "ok"
}
```

### Competitions

The competitions endpoints use `statsbombpy.competitions()` to fetch data from StatsBomb's open data repository.

#### Get All Competitions

```
GET /competitions
```

Returns a list of all available competitions with their seasons. Supports both flat and grouped response formats.

**Query Parameters:**

- `grouped` (boolean, optional): Group seasons by competition (default: false)
  - `false`: Returns flat list of competition/season combinations
  - `true`: Returns competitions with nested seasons array

**Example Request (Flat Response):**

```
GET /competitions
```

**Example Response (Flat):**

```json
[
  {
    "competition_id": 11,
    "season_id": 90,
    "competition_name": "La Liga",
    "season_name": "2020/2021",
    "country_name": "Spain"
  },
  {
    "competition_id": 11,
    "season_id": 27,
    "competition_name": "La Liga",
    "season_name": "2015/2016",
    "country_name": "Spain"
  },
  {
    "competition_id": 2,
    "season_id": 44,
    "competition_name": "Premier League",
    "season_name": "2003/2004",
    "country_name": "England"
  }
]
```

**Example Request (Grouped Response):**

```
GET /competitions?grouped=true
```

**Example Response (Grouped):**

```json
[
  {
    "competition_id": 11,
    "competition_name": "La Liga",
    "country_name": "Spain",
    "seasons": [
      {
        "season_id": 90,
        "season_name": "2020/2021"
      },
      {
        "season_id": 27,
        "season_name": "2015/2016"
      }
    ]
  },
  {
    "competition_id": 2,
    "competition_name": "Premier League",
    "country_name": "England",
    "seasons": [
      {
        "season_id": 44,
        "season_name": "2003/2004"
      },
      {
        "season_id": 27,
        "season_name": "2015/2016"
      }
    ]
  }
]
```

#### Get Seasons by Competition

```
GET /competitions/seasons
```

Returns seasons filtered by competition ID. Useful for dependent dropdown functionality in frontend applications.

**Query Parameters:**

- `competition_id` (int, required): The ID of the competition to filter seasons

**Example Request:**

```
GET /competitions/seasons?competition_id=11
```

**Example Response:**

```json
[
  {
    "season_id": 90,
    "season_name": "2020/2021"
  },
  {
    "season_id": 89,
    "season_name": "2019/2020"
  },
  {
    "season_id": 27,
    "season_name": "2015/2016"
  }
]
```

**Error Responses:**

- `404 Not Found`: Competition with specified ID not found
- `422 Unprocessable Entity`: Missing required competition_id parameter

**Common Use Cases:**

- **Frontend Dropdowns**: Use the flat response to populate a single dropdown with all competition/season combinations
- **Dependent Dropdowns**: Use `/competitions?grouped=true` to populate a competition dropdown, then use `/competitions/seasons?competition_id=X` to populate the seasons dropdown based on the selected competition
- **Data Analysis**: Use the grouped response to understand the structure of available data across competitions

#### Get Matches by Competition and Season

```
GET /competitions/{competition_id}/seasons/{season_id}/matches
```

Returns matches for a specific competition and season.

**Parameters:**

- `competition_id` (path parameter): The ID of the competition
- `season_id` (path parameter): The ID of the season
- `round` (query parameter, optional): Filter by match round
- `limit` (query parameter, optional): Limit the number of results

**Response Example:**

```json
[
  {
    "match_id": 2275093,
    "match_date": "2019-08-16",
    "match_round": "Matchday 1",
    "home_team": "Athletic Club",
    "away_team": "FC Barcelona",
    "home_score": 1,
    "away_score": 0,
    "competition_id": 11,
    "season_id": 1
  },
  {
    "match_id": 2275094,
    "match_date": "2019-08-17",
    "match_round": "Matchday 1",
    "home_team": "Celta Vigo",
    "away_team": "Real Madrid",
    "home_score": 1,
    "away_score": 3,
    "competition_id": 11,
    "season_id": 1
  }
]
```

### Matches

#### Get Matches

```
GET /matches
```

Returns a list of matches for a specific competition and season. This endpoint allows you to retrieve match data including basic information such as teams, scores, dates, and match rounds. You can filter the results by round and limit the number of matches returned.

**Query Parameters:**

- `competition_id` (int, required): The ID of the competition
- `season_id` (int, required): The ID of the season
- `round` (string, optional): Filter by match round
- `limit` (int, optional): Limit the number of results

**Example Request:**

```
GET /matches?competition_id=43&season_id=3
```

**Example Response:**

```json
[
  {
    "match_id": 2275093,
    "match_date": "2019-08-16",
    "match_round": "Matchday 1",
    "home_team": "Athletic Club",
    "away_team": "FC Barcelona",
    "home_score": 1,
    "away_score": 0,
    "competition_id": 43,
    "season_id": 3
  },
  {
    "match_id": 2275094,
    "match_date": "2019-08-17",
    "match_round": "Matchday 1",
    "home_team": "Celta Vigo",
    "away_team": "Real Madrid",
    "home_score": 1,
    "away_score": 3,
    "competition_id": 43,
    "season_id": 3
  }
]
```

#### Get Match Detail

```
GET /matches/{match_id}
```

Returns detailed information for a specific match.

**Parameters:**

- `match_id` (path parameter): The ID of the match

**Response Example:**

```json
{
  "match_id": 2275093,
  "match_date": "2019-08-16",
  "match_round": "Matchday 1",
  "home_team": "Athletic Club",
  "away_team": "FC Barcelona",
  "home_score": 1,
  "away_score": 0,
  "competition_id": 11,
  "season_id": 1,
  "stadium": "San Mamés",
  "referee": "Carlos del Cerro Grande",
  "events_count": 1394
}
```

## Players

The players endpoints provide access to player information and statistics, including heat map data for player positioning analysis.

### Get Players

```
GET /players
```

Returns a list of all players available in the StatsBomb dataset.

**Query Parameters:**

- `competition_id` (integer, optional): Filter players by competition
- `season_id` (integer, optional): Filter players by season

**Example Request:**

```
GET /players?competition_id=11&season_id=90
```

**Response Example:**

```json
[
  {
    "player_id": 5503,
    "player_name": "Lionel Andrés Messi Cuccittini",
    "player_nickname": "Lionel Messi",
    "jersey_number": 10,
    "country": "Argentina",
    "position": "Right Wing"
  },
  {
    "player_id": 5597,
    "player_name": "Luis Alberto Suárez Díaz",
    "player_nickname": "Luis Suárez",
    "jersey_number": 9,
    "country": "Uruguay",
    "position": "Centre Forward"
  }
]
```

### Get Player Heat Map

```
GET /players/{player_id}/heatmap
```

Returns heat map data for a specific player, showing their positioning throughout matches.

**Parameters:**

- `player_id` (path parameter): The ID of the player

**Query Parameters:**

- `competition_id` (integer, optional): Filter by competition
- `season_id` (integer, optional): Filter by season
- `match_id` (integer, optional): Filter by specific match

**Example Request:**

```
GET /players/5503/heatmap?competition_id=11&season_id=90
```

**Response Example:**

```json
{
  "player_id": 5503,
  "player_name": "Lionel Andrés Messi Cuccittini",
  "heat_map_data": [
    {
      "x": 85.2,
      "y": 45.6,
      "intensity": 0.8,
      "match_id": 2275093,
      "minute": 23
    },
    {
      "x": 78.4,
      "y": 52.1,
      "intensity": 0.6,
      "match_id": 2275093,
      "minute": 45
    }
  ],
  "total_positions": 1247,
  "matches_included": 5
}
```

**Heat Map Data Fields:**

- `x`: X coordinate on the pitch (0-100, where 0 is left touchline, 100 is right touchline)
- `y`: Y coordinate on the pitch (0-100, where 0 is bottom goal line, 100 is top goal line)
- `intensity`: Relative intensity of player presence at this position (0.0-1.0)
- `match_id`: The match where this position was recorded
- `minute`: The minute of the match when this position was recorded

## Error Handling

The API returns standard HTTP status codes to indicate the success or failure of a request:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was invalid or missing required parameters
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

Error responses include a JSON object with an error message:

```json
{
  "detail": "Error message describing the issue"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. However, please be considerate with your API usage.

## Future Endpoints

The following endpoints are planned for future releases:

- `/teams/`: Get team information and statistics
- `/players/`: Get player information and statistics
- `/events/`: Get detailed event data for matches

## Switching to StatsBomb Private API

The API is designed to be easily switched from StatsBomb's open data to their private API. When this switch occurs, the endpoints will remain the same, but authentication will be required.

To use the private API, you will need to:

1. Obtain API credentials from StatsBomb
2. Set the following environment variables:
   - `STATSBOMB_USE_PRIVATE_API=true`
   - `STATSBOMB_API_KEY=your_api_key`
   - `STATSBOMB_API_URL=private_api_url`

No changes to your client code will be necessary as the API interface will remain consistent.