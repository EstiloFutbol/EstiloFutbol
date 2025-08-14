from statsbombpy import sb
from app.models.match import Match, MatchDetail
from app.config import settings
from typing import List, Dict, Any, Optional
import pandas as pd

class StatsBombService:
    """Service for interacting with StatsBomb data"""
    
    def __init__(self):
        """Initialize the StatsBomb service"""
        # If using private API, configure credentials
        if settings.STATSBOMB_USE_PRIVATE_API:
            # This would be implemented when switching to private API
            pass
    
    def get_competitions(self) -> List[Dict[str, Any]]:
        """Get available competitions with their seasons"""
        competitions_df = sb.competitions()
        
        # Group by competition and collect seasons
        result = []
        for comp_id in competitions_df['competition_id'].unique():
            comp_data = competitions_df[competitions_df['competition_id'] == comp_id].iloc[0]
            
            # Get all seasons for this competition
            seasons = []
            for _, season_row in competitions_df[competitions_df['competition_id'] == comp_id].iterrows():
                seasons.append({
                    'season_id': season_row.get('season_id'),
                    'season_name': season_row.get('season_name')
                })
            
            # Create competition entry with seasons
            competition = {
                'competition_id': comp_id,
                'competition_name': comp_data.get('competition_name'),
                'country_name': comp_data.get('country_name'),
                'seasons': seasons
            }
            
            result.append(competition)
            
        return result
    
    def get_matches(self, competition_id: int, season_id: int) -> List[Match]:
        """Get matches for a specific competition and season"""
        matches_df = sb.matches(competition_id=competition_id, season_id=season_id)
        
        # Convert DataFrame to list of Match objects
        matches = []
        for _, row in matches_df.iterrows():
            match = Match(
                match_id=row.get('match_id'),
                match_date=row.get('match_date'),
                match_round=row.get('match_round', ''),
                home_team=row.get('home_team'),
                away_team=row.get('away_team'),
                home_score=row.get('home_score'),
                away_score=row.get('away_score'),
                competition_id=competition_id,
                season_id=season_id
            )
            matches.append(match)
        
        return matches
    
    def get_match_detail(self, match_id: int) -> Optional[MatchDetail]:
        """Get detailed information for a specific match"""
        try:
            # The statsbombpy library doesn't support fetching matches by match_id directly
            # Instead, we need to try to fetch events for the match_id to see if it exists
            try:
                # Try to get events for the match to check if it exists
                events_df = sb.events(match_id=match_id)
                if events_df.empty:
                    return None
            except Exception as e:
                # If there's an error fetching events, the match likely doesn't exist
                print(f"Match not found: {e}")
                # Return None to indicate match not found (will be converted to 404 in the API layer)
                return None
                
            # Since we can't get match details directly by match_id, we need to find the match
            # in all competitions to get its details
            # This is a simplified approach - in a production environment, you might want to
            # cache competition/match data to avoid fetching all competitions each time
            
            # Get all competitions
            competitions = self.get_competitions()
            
            # Initialize variables to store match information
            match_data = None
            competition_id = None
            season_id = None
            
            # Search for the match in all competitions
            for comp in competitions:
                try:
                    comp_id = comp.get('competition_id')
                    seasons = comp.get('seasons', [])
                    
                    for season in seasons:
                        try:
                            season_id = season.get('season_id')
                            matches_df = sb.matches(competition_id=comp_id, season_id=season_id)
                            
                            # Check if the match is in this competition/season
                            match_found = matches_df[matches_df['match_id'] == match_id]
                            
                            if not match_found.empty:
                                match_data = match_found.iloc[0]
                                competition_id = comp_id
                                season_id = season_id
                                break
                        except Exception:
                            continue
                    
                    if match_data is not None:
                        break
                except Exception:
                    continue
            
            # If we couldn't find the match in any competition, return None
            if match_data is None:
                return None
            
            # Create MatchDetail object
            match_detail = MatchDetail(
                match_id=match_id,
                match_date=match_data.get('match_date'),
                match_round=match_data.get('match_round', ''),
                home_team=match_data.get('home_team'),
                away_team=match_data.get('away_team'),
                home_score=match_data.get('home_score'),
                away_score=match_data.get('away_score'),
                competition_id=competition_id,
                season_id=season_id,
                stadium=match_data.get('stadium', {}).get('name', '') if isinstance(match_data.get('stadium'), dict) else '',
                referee=match_data.get('referee', {}).get('name', '') if isinstance(match_data.get('referee'), dict) else '',
                events_count=len(events_df) if not events_df.empty else 0,
                # Additional statistics could be calculated here
            )
            
            return match_detail
            
        except Exception as e:
            print(f"Error fetching match detail: {e}")
            return None