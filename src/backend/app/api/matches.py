from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.services.statsbomb import StatsBombService
from app.models.match import Match, MatchDetail

router = APIRouter(prefix="/matches", tags=["matches"])
statsbomb_service = StatsBombService()

@router.get("/", response_model=List[Match])
async def get_matches(
    competition_id: int = Query(..., description="Competition ID"),
    season_id: int = Query(..., description="Season ID"),
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

@router.get("/{match_id}", response_model=MatchDetail)
async def get_match_detail(match_id: int):
    """Get detailed information for a specific match"""
    try:
        match_detail = statsbomb_service.get_match_detail(match_id)
        if not match_detail:
            raise HTTPException(status_code=404, detail="Match not found")
        return match_detail
    except HTTPException:
        # Re-raise HTTP exceptions (like 404) without wrapping them
        raise
    except Exception as e:
        # For other exceptions, return 500
        raise HTTPException(status_code=500, detail=str(e))