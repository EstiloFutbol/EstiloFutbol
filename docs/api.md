# API Documentation

## Overview

The Estilo Futbol API provides access to football data from StatsBomb. This document outlines the available endpoints, their parameters, and response formats.

## Base URL

When running locally, the API is available at:

```
http://localhost:8000/api
```

When deployed to Vercel, the API will be available at your Vercel deployment URL:

```
https://your-vercel-app.vercel.app/api
```

## Authentication

Currently, the API uses StatsBomb's open data and does not require authentication. Future versions may support StatsBomb's private API, which will require API keys.

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