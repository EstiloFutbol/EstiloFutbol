from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any, Union
from app.services.statsbomb import StatsBombService
from app.models.competition import Competition, Season, FlatCompetition
from app.models.match import Match

router = APIRouter(prefix="/competitions", tags=["competitions"])
statsbomb_service = StatsBombService()

@router.get("/")
async def get_competitions(
    grouped: bool = Query(False, description="Group seasons by competition (default: false)")
):
    """
    Get all available competitions with their seasons.
    
    - **grouped=false**: Returns flat list with competition_id, season_id, competition_name, season_name
    - **grouped=true**: Returns competitions with nested seasons array
    """
    try:
        competitions_data = statsbomb_service.get_competitions()
        
        if not grouped:
            # Return flat structure for easier frontend consumption
            flat_competitions = []
            for comp in competitions_data:
                for season in comp.get('seasons', []):
                    flat_competitions.append({
                        'competition_id': comp['competition_id'],
                        'season_id': season['season_id'],
                        'competition_name': comp['competition_name'],
                        'season_name': season['season_name'],
                        'country_name': comp.get('country_name', '')
                    })
            return flat_competitions
        else:
            # Return grouped structure - convert to Competition models
            competitions = []
            for comp_data in competitions_data:
                # Convert seasons to Season models
                seasons = [
                    Season(
                        season_id=season['season_id'],
                        season_name=season['season_name']
                    )
                    for season in comp_data.get('seasons', [])
                ]
                
                # Create Competition model
                competition = Competition(
                    competition_id=comp_data['competition_id'],
                    competition_name=comp_data['competition_name'],
                    country_name=comp_data.get('country_name', ''),
                    seasons=seasons
                )
                competitions.append(competition)
            
            return competitions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/seasons", response_model=List[Season])
async def get_seasons(
    competition_id: int = Query(..., description="Competition ID to filter seasons")
):
    """
    Get seasons for a specific competition.
    Supports dependent dropdowns on the frontend.
    """
    try:
        competitions = statsbomb_service.get_competitions()
        
        # Find the specific competition
        target_competition = None
        for comp in competitions:
            if comp['competition_id'] == competition_id:
                target_competition = comp
                break
        
        if not target_competition:
            raise HTTPException(
                status_code=404, 
                detail=f"Competition with ID {competition_id} not found"
            )
        
        return target_competition.get('seasons', [])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{competition_id}/seasons/{season_id}/matches", response_model=List[Match])
async def get_matches_by_competition_season(
    competition_id: int,
    season_id: int,
    round: Optional[str] = Query(None, description="Filter by round"),
    limit: Optional[int] = Query(None, description="Limit number of results")
):
    """Get matches for a specific competition and season"""
    try:
        matches = statsbomb_service.get_matches(competition_id, season_id)
        
        # Apply filters if provided
        if round:
            matches = [m for m in matches if m.match_round == round]
        
        # Apply limit if provided
        if limit and limit > 0:
            matches = matches[:limit]
            
        return matches
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))