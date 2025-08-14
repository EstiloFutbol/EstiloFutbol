from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)

def test_read_root():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Estilo Futbol API"}

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_get_matches_missing_params():
    """Test the matches endpoint with missing parameters"""
    response = client.get("/api/matches/")
    assert response.status_code == 422  # Unprocessable Entity due to missing required params

def test_get_matches():
    """Test the matches endpoint with valid parameters"""
    # Using StatsBomb open data competition and season IDs
    response = client.get("/api/matches/?competition_id=11&season_id=1")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.fixture
def mock_statsbomb_service(monkeypatch):
    """Mock the StatsBombService to avoid calling the live API"""
    from datetime import date
    from app.models.match import Match
    from app.services.statsbomb import StatsBombService
    
    # Create mock data
    mock_matches = [
        Match(
            match_id=1,
            match_date=date(2023, 1, 1),
            match_round="Round 1",
            home_team="Team A",
            away_team="Team B",
            home_score=2,
            away_score=1,
            competition_id=11,
            season_id=1
        ),
        Match(
            match_id=2,
            match_date=date(2023, 1, 8),
            match_round="Round 2",
            home_team="Team C",
            away_team="Team D",
            home_score=0,
            away_score=0,
            competition_id=11,
            season_id=1
        )
    ]
    
    # Mock the get_matches method
    def mock_get_matches(self, competition_id, season_id):
        if competition_id == 11 and season_id == 1:
            return mock_matches
        return []
    
    # Apply the mock
    monkeypatch.setattr(StatsBombService, "get_matches", mock_get_matches)
    
    return mock_matches

def test_get_matches_success(mock_statsbomb_service):
    """Test the matches endpoint with valid parameters using mocked data"""
    response = client.get("/api/matches/?competition_id=11&season_id=1")
    assert response.status_code == 200
    
    # Verify response data
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    
    # Check first match details
    assert data[0]["match_id"] == 1
    assert data[0]["home_team"] == "Team A"
    assert data[0]["away_team"] == "Team B"
    assert data[0]["home_score"] == 2
    assert data[0]["away_score"] == 1
    
    # Check second match details
    assert data[1]["match_id"] == 2
    assert data[1]["home_team"] == "Team C"
    assert data[1]["away_team"] == "Team D"

def test_get_matches_with_round_filter(mock_statsbomb_service):
    """Test the matches endpoint with round filter"""
    response = client.get("/api/matches/?competition_id=11&season_id=1&round=Round 1")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["match_round"] == "Round 1"
    assert data[0]["match_id"] == 1

def test_get_matches_with_limit(mock_statsbomb_service):
    """Test the matches endpoint with limit parameter"""
    response = client.get("/api/matches/?competition_id=11&season_id=1&limit=1")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["match_id"] == 1

def test_get_matches_invalid_competition(mock_statsbomb_service):
    """Test the matches endpoint with invalid competition ID"""
    response = client.get("/api/matches/?competition_id=999&season_id=1")
    assert response.status_code == 200
    assert response.json() == []

@pytest.fixture
def mock_competitions_service(monkeypatch):
    """Mock the StatsBombService competitions method to avoid calling the live API"""
    from app.services.statsbomb import StatsBombService
    
    # Create mock competitions data
    mock_competitions_data = [
        {
            'competition_id': 11,
            'competition_name': 'La Liga',
            'country_name': 'Spain',
            'seasons': [
                {'season_id': 1, 'season_name': '2020/2021'},
                {'season_id': 2, 'season_name': '2021/2022'}
            ]
        },
        {
            'competition_id': 2,
            'competition_name': 'Premier League',
            'country_name': 'England',
            'seasons': [
                {'season_id': 1, 'season_name': '2020/2021'},
                {'season_id': 3, 'season_name': '2019/2020'}
            ]
        },
        {
            'competition_id': 37,
            'competition_name': 'FIFA Women\'s World Cup',
            'country_name': 'International',
            'seasons': [
                {'season_id': 106, 'season_name': '2019'}
            ]
        }
    ]
    
    # Mock the get_competitions method
    def mock_get_competitions(self):
        return mock_competitions_data
    
    # Apply the mock
    monkeypatch.setattr(StatsBombService, "get_competitions", mock_get_competitions)
    
    return mock_competitions_data

def test_get_competitions_flat(mock_competitions_service):
    """Test the competitions endpoint with flat response (default)"""
    response = client.get("/api/competitions/")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5  # Total number of competition-season combinations
    
    # Check first flat competition entry
    first_entry = data[0]
    assert 'competition_id' in first_entry
    assert 'season_id' in first_entry
    assert 'competition_name' in first_entry
    assert 'season_name' in first_entry
    assert 'country_name' in first_entry
    
    # Verify specific data
    la_liga_entries = [entry for entry in data if entry['competition_id'] == 11]
    assert len(la_liga_entries) == 2
    assert la_liga_entries[0]['competition_name'] == 'La Liga'
    assert la_liga_entries[0]['country_name'] == 'Spain'

def test_get_competitions_grouped(mock_competitions_service):
    """Test the competitions endpoint with grouped response"""
    response = client.get("/api/competitions/?grouped=true")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3  # Number of unique competitions
    
    # Check first grouped competition entry
    first_comp = data[0]
    assert 'competition_id' in first_comp
    assert 'competition_name' in first_comp
    assert 'country_name' in first_comp
    assert 'seasons' in first_comp
    assert isinstance(first_comp['seasons'], list)
    
    # Find La Liga and verify its seasons
    la_liga = next((comp for comp in data if comp['competition_id'] == 11), None)
    assert la_liga is not None
    assert la_liga['competition_name'] == 'La Liga'
    assert len(la_liga['seasons']) == 2
    assert la_liga['seasons'][0]['season_id'] == 1
    assert la_liga['seasons'][0]['season_name'] == '2020/2021'

def test_get_seasons_valid_competition(mock_competitions_service):
    """Test the seasons endpoint with valid competition ID"""
    response = client.get("/api/competitions/seasons?competition_id=11")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    
    # Check season structure
    first_season = data[0]
    assert 'season_id' in first_season
    assert 'season_name' in first_season
    
    # Verify specific seasons for La Liga
    season_ids = [season['season_id'] for season in data]
    assert 1 in season_ids
    assert 2 in season_ids
    
    season_names = [season['season_name'] for season in data]
    assert '2020/2021' in season_names
    assert '2021/2022' in season_names

def test_get_seasons_invalid_competition(mock_competitions_service):
    """Test the seasons endpoint with invalid competition ID"""
    response = client.get("/api/competitions/seasons?competition_id=999")
    assert response.status_code == 404
    
    data = response.json()
    assert 'detail' in data
    assert 'Competition with ID 999 not found' in data['detail']

def test_get_seasons_missing_competition_id():
    """Test the seasons endpoint with missing competition_id parameter"""
    response = client.get("/api/competitions/seasons")
    assert response.status_code == 422  # Unprocessable Entity due to missing required param

def test_get_seasons_single_season_competition(mock_competitions_service):
    """Test the seasons endpoint for competition with single season"""
    response = client.get("/api/competitions/seasons?competition_id=37")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['season_id'] == 106
    assert data[0]['season_name'] == '2019'

def test_get_competitions_error_handling(monkeypatch):
    """Test competitions endpoint error handling"""
    from app.services.statsbomb import StatsBombService
    
    # Mock to raise an exception
    def mock_get_competitions_error(self):
        raise Exception("StatsBomb API error")
    
    monkeypatch.setattr(StatsBombService, "get_competitions", mock_get_competitions_error)
    
    response = client.get("/api/competitions/")
    assert response.status_code == 500
    assert 'detail' in response.json()

def test_get_seasons_error_handling(monkeypatch):
    """Test seasons endpoint error handling"""
    from app.services.statsbomb import StatsBombService
    
    # Mock to raise an exception
    def mock_get_competitions_error(self):
        raise Exception("StatsBomb API error")
    
    monkeypatch.setattr(StatsBombService, "get_competitions", mock_get_competitions_error)
    
    response = client.get("/api/competitions/seasons?competition_id=11")
    assert response.status_code == 500
    assert 'detail' in response.json()

def test_get_matches_by_competition_season():
    """Test the matches by competition and season endpoint"""
    # Using StatsBomb open data competition and season IDs
    response = client.get("/api/competitions/11/seasons/1/matches")
    assert response.status_code == 200
    assert isinstance(response.json(), list)