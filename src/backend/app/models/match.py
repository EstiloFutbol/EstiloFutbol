from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class Match(BaseModel):
    """Basic match information"""
    match_id: int
    match_date: date
    match_round: Optional[str] = Field(None, description="Round of the match")
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    competition_id: int
    season_id: int

class MatchDetail(Match):
    """Detailed match information including additional fields"""
    stadium: Optional[str] = Field(None, description="Stadium where the match was played")
    referee: Optional[str] = Field(None, description="Referee who officiated the match")
    events_count: Optional[int] = Field(None, description="Total number of events in the match")
    # Additional statistics could be added here