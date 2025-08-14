from pydantic import BaseModel, Field
from typing import List, Optional, Union

class Season(BaseModel):
    """Season information"""
    season_id: int
    season_name: str

class Competition(BaseModel):
    """Competition information with nested seasons"""
    competition_id: int
    competition_name: str
    country_name: str
    seasons: Optional[List[Season]] = Field(default_factory=list, description="Available seasons for this competition")

class FlatCompetition(BaseModel):
    """Flat competition structure for easier frontend consumption"""
    competition_id: int
    season_id: int
    competition_name: str
    season_name: str
    country_name: str