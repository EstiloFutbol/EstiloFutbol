// Main JavaScript for Estilo Futbol

// API base URL - dynamically set based on environment
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api';
const API_KEY = 'hpTMmnwLi8Wo2oJh3pOl7Md2FYt5FbI9'; // API key for authentication

// Helper function to create headers with API key
function getApiHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    };
}

// DOM Elements
const competitionSelect = document.getElementById('competition-select');
const seasonSelect = document.getElementById('season-select');
const loadDataBtn = document.getElementById('load-data-btn');
const roundFilter = document.getElementById('round-filter');
const statCategory = document.getElementById('stat-category');
const playerSelection = document.getElementById('player-selection');
const playerSelect = document.getElementById('player-select');
const heatmapContainer = document.getElementById('heatmap-container');
const tabLinks = document.querySelectorAll('nav a');
const tabContents = document.querySelectorAll('.tab-content');

// Match List Elements - Removed (no longer needed)

// State
let currentCompetition = null;
let currentSeason = null;
let matches = [];
let rounds = [];
let players = [];
let currentPlayer = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load competitions
    loadCompetitions();
    
    // Set up event listeners
    setupEventListeners();
});

// Match list functions removed - no longer needed

// Load competitions from API
async function loadCompetitions() {
    try {
        // Show loading state
        competitionSelect.innerHTML = '<option value="" disabled selected>Loading competitions...</option>';
        competitionSelect.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/competitions?grouped=true`, {
            headers: getApiHeaders()
        });
        if (!response.ok) throw new Error('Failed to load competitions');
        
        const competitions = await response.json();
        
        // Clear and populate competition select
        competitionSelect.innerHTML = '<option value="" disabled selected>Select a competition</option>';
        competitionSelect.disabled = false;
        
        if (competitions.length === 0) {
            competitionSelect.innerHTML = '<option value="" disabled selected>No competitions available</option>';
            return;
        }
        
        competitions.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp.competition_id;
            option.textContent = `${comp.competition_name} (${comp.country_name})`;
            
            // Store seasons data for quick access
            option.dataset.seasons = JSON.stringify(comp.seasons || []);
            
            competitionSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading competitions:', error);
        competitionSelect.innerHTML = '<option value="" disabled selected>Error loading competitions</option>';
        competitionSelect.disabled = false;
        
        // For demo purposes, add some sample competitions
        addSampleCompetitions();
    }
}

// Add sample competitions for demo
function addSampleCompetitions() {
    const sampleCompetitions = [
        { id: 11, name: 'La Liga' },
        { id: 2, name: 'Premier League' },
        { id: 37, name: 'Womens World Cup' }
    ];
    
    competitionSelect.innerHTML = '<option value="" disabled selected>Select a competition</option>';
    
    sampleCompetitions.forEach(comp => {
        const option = document.createElement('option');
        option.value = comp.id;
        option.textContent = comp.name;
        competitionSelect.appendChild(option);
    });
}

// Match competition loading functions removed - no longer needed

// Load seasons for selected competition
async function loadSeasons(competitionId) {
    try {
        // Show loading state
        seasonSelect.innerHTML = '<option value="" disabled selected>Loading seasons...</option>';
        seasonSelect.disabled = true;
        
        // First try to get seasons from the stored data in the competition option
        const competitionOption = competitionSelect.querySelector(`option[value="${competitionId}"]`);
        let seasons = [];
        
        if (competitionOption && competitionOption.dataset.seasons) {
            try {
                seasons = JSON.parse(competitionOption.dataset.seasons);
            } catch (e) {
                console.warn('Failed to parse stored seasons data');
            }
        }
        
        // If no stored seasons or empty, fetch from API
        if (seasons.length === 0) {
            const response = await fetch(`${API_BASE_URL}/competitions/seasons?competition_id=${competitionId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No seasons found for this competition');
                }
                throw new Error('Failed to load seasons');
            }
            seasons = await response.json();
        }
        
        // Clear and populate season select
        seasonSelect.innerHTML = '<option value="" disabled selected>Select a season</option>';
        seasonSelect.disabled = false;
        
        if (seasons.length === 0) {
            seasonSelect.innerHTML = '<option value="" disabled selected>No seasons found</option>';
            seasonSelect.disabled = true;
            return;
        }
        
        // Sort seasons by name (most recent first)
        seasons.sort((a, b) => {
            // Try to extract year from season name for better sorting
            const yearA = a.season_name.match(/(\d{4})/);
            const yearB = b.season_name.match(/(\d{4})/);
            
            if (yearA && yearB) {
                return parseInt(yearB[1]) - parseInt(yearA[1]);
            }
            
            return b.season_name.localeCompare(a.season_name);
        });
        
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.season_id;
            option.textContent = season.season_name;
            seasonSelect.appendChild(option);
        });
        
        // Enable the load data button if both competition and season are selected
        updateLoadDataButton();
        
    } catch (error) {
        console.error('Error loading seasons:', error);
        seasonSelect.innerHTML = `<option value="" disabled selected>${error.message}</option>`;
        seasonSelect.disabled = true;
        
        // Disable load data button
        loadDataBtn.disabled = true;
    }
}

// Add sample seasons for demo
function addSampleSeasons() {
    const sampleSeasons = [
        { id: 1, name: '2018/2019' },
        { id: 2, name: '2019/2020' },
        { id: 3, name: '2020/2021' }
    ];
    
    seasonSelect.innerHTML = '<option value="" disabled selected>Select a season</option>';
    seasonSelect.disabled = false;
    
    sampleSeasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.id;
        option.textContent = season.name;
        seasonSelect.appendChild(option);
    });
}

// Load matches for selected competition and season
async function loadMatches(competitionId, seasonId) {
    try {
        const response = await fetch(`${API_BASE_URL}/matches/?competition_id=${competitionId}&season_id=${seasonId}`, {
            headers: getApiHeaders()
        });
        if (!response.ok) throw new Error('Failed to load matches');
        
        matches = await response.json();
        
        // Extract unique rounds
        rounds = [...new Set(matches.map(match => match.match_round).filter(round => round))];
        
        // Populate round filter
        populateRoundFilter();
        
        // Display overview
        displayOverview();
        
        // Display statistics
        displayStatistics();
        
        // Load players for heat maps
        await loadPlayers(competitionId, seasonId);
        
    } catch (error) {
        console.error('Error loading matches:', error);
        // For demo purposes, add some sample matches
        addSampleMatches();
    }
}

// Add sample matches for demo
function addSampleMatches() {
    matches = [
        // Group Stage Matches
        {
            match_id: 1,
            match_date: '2024-06-15',
            match_round: 'Group Stage',
            match_day: 'Matchday 1',
            group: 'Group A',
            phase_order: 1,
            home_team: 'Germany',
            away_team: 'Scotland',
            home_score: 5,
            away_score: 1
        },
        {
            match_id: 2,
            match_date: '2024-06-15',
            match_round: 'Group Stage',
            match_day: 'Matchday 1',
            group: 'Group A',
            phase_order: 1,
            home_team: 'Hungary',
            away_team: 'Switzerland',
            home_score: 1,
            away_score: 3
        },
        {
            match_id: 3,
            match_date: '2024-06-19',
            match_round: 'Group Stage',
            match_day: 'Matchday 2',
            group: 'Group A',
            phase_order: 1,
            home_team: 'Germany',
            away_team: 'Hungary',
            home_score: 2,
            away_score: 0
        },
        {
            match_id: 4,
            match_date: '2024-06-19',
            match_round: 'Group Stage',
            match_day: 'Matchday 2',
            group: 'Group A',
            phase_order: 1,
            home_team: 'Scotland',
            away_team: 'Switzerland',
            home_score: 1,
            away_score: 1
        },
        // Round of 16
        {
            match_id: 5,
            match_date: '2024-06-29',
            match_round: 'Round of 16',
            match_day: 'Round of 16',
            group: null,
            phase_order: 2,
            home_team: 'Germany',
            away_team: 'Denmark',
            home_score: 2,
            away_score: 0
        },
        {
            match_id: 6,
            match_date: '2024-06-30',
            match_round: 'Round of 16',
            match_day: 'Round of 16',
            group: null,
            phase_order: 2,
            home_team: 'England',
            away_team: 'Slovakia',
            home_score: 2,
            away_score: 1
        },
        // Quarter Finals
        {
            match_id: 7,
            match_date: '2024-07-05',
            match_round: 'Quarter Final',
            match_day: 'Quarter Final',
            group: null,
            phase_order: 3,
            home_team: 'Germany',
            away_team: 'Spain',
            home_score: 1,
            away_score: 2
        },
        {
            match_id: 8,
            match_date: '2024-07-06',
            match_round: 'Quarter Final',
            match_day: 'Quarter Final',
            group: null,
            phase_order: 3,
            home_team: 'England',
            away_team: 'Switzerland',
            home_score: 1,
            away_score: 1
        },
        // Semi Final
        {
            match_id: 9,
            match_date: '2024-07-09',
            match_round: 'Semi Final',
            match_day: 'Semi Final',
            group: null,
            phase_order: 4,
            home_team: 'Spain',
            away_team: 'France',
            home_score: 2,
            away_score: 1
        },
        {
            match_id: 10,
            match_date: '2024-07-10',
            match_round: 'Semi Final',
            match_day: 'Semi Final',
            group: null,
            phase_order: 4,
            home_team: 'England',
            away_team: 'Netherlands',
            home_score: 2,
            away_score: 1
        },
        // Final
        {
            match_id: 11,
            match_date: '2024-07-14',
            match_round: 'Final',
            match_day: 'Final',
            group: null,
            phase_order: 5,
            home_team: 'Spain',
            away_team: 'England',
            home_score: 2,
            away_score: 1
        }
    ];
    
    // Extract unique rounds
    rounds = [...new Set(matches.map(match => match.match_round))];
    
    // Populate round filter
    populateRoundFilter();
    
    // Display overview
    displayOverview();
    
    // Display statistics
    displayStatistics();
}

// Populate round filter
function populateRoundFilter() {
    roundFilter.innerHTML = '<option value="all">All Rounds</option>';
    
    rounds.forEach(round => {
        const option = document.createElement('option');
        option.value = round;
        option.textContent = round;
        roundFilter.appendChild(option);
    });
}

// Display matches
// Function implemented above

// Functions implemented elsewhere

// Display matches function

function displayMatches(roundValue = 'all') {
    const matchesContainer = document.querySelector('#matches-tab .matches-container');
    if (!matchesContainer) {
        console.warn('Matches container not found');
        return;
    }
    
    matchesContainer.innerHTML = '';
    
    if (!matches || matches.length === 0) {
        matchesContainer.innerHTML = '<div class="no-data-message">No matches found for the selected criteria.</div>';
        return;
    }
    
    // Filter matches by round if specified
    let filteredMatches = matches;
    if (roundValue && roundValue !== 'all') {
        filteredMatches = matches.filter(match => match.match_round === roundValue);
    }
    
    // Group matches by round
    const matchesByRound = {};
    filteredMatches.forEach(match => {
        const round = match.match_round || 'Unknown';
        if (!matchesByRound[round]) {
            matchesByRound[round] = [];
        }
        matchesByRound[round].push(match);
    });
    
    // Display matches grouped by round
    Object.keys(matchesByRound).forEach(round => {
        const roundMatches = matchesByRound[round];
        if (roundMatches.length > 0) {
            // Add round header
            const roundHeader = document.createElement('h3');
            roundHeader.className = 'round-header';
            roundHeader.textContent = `Round: ${round}`;
            matchesContainer.appendChild(roundHeader);
            
            // Add matches for this round
            roundMatches.forEach(match => {
                const matchItem = createMatchElement(match);
                matchesContainer.appendChild(matchItem);
            });
        }
    });
}

function createMatchElement(match) {
    const matchItem = document.createElement('div');
    matchItem.className = 'match-item';
    matchItem.dataset.matchId = match.match_id;
    
    // Format date
    const matchDate = new Date(match.match_date);
    const formattedDate = matchDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    // Determine winner for styling
    const homeWinner = match.home_score > match.away_score;
    const awayWinner = match.away_score > match.home_score;
    const isDraw = match.home_score === match.away_score;
    
    matchItem.innerHTML = `
        <div class="match-date">${formattedDate}</div>
        <div class="match-teams">
            <div class="team home-team ${homeWinner ? 'winner' : ''}">${match.home_team}</div>
            <div class="score">${match.home_score} - ${match.away_score}</div>
            <div class="team away-team ${awayWinner ? 'winner' : ''}">${match.away_team}</div>
        </div>
        <div class="match-round">Round ${match.round || 'N/A'}</div>
    `;
    
    // Add click event to show match details
    matchItem.addEventListener('click', () => {
        // Future enhancement: Show match details in a modal or navigate to match detail page
        console.log('Match clicked:', match);
    });
    
    return matchItem;
}

// Function implemented elsewhere

// Duplicate populateRoundFilter function removed - using the one at line 280

// Display matches
// This function has been implemented earlier in the file

// Display overview
// This function has been implemented earlier in the file

// Display statistics
// This function has been implemented earlier in the file

// This function has been implemented earlier in the file

// This function has been implemented earlier in the file
// End of file cleanup
// End of file cleanup
    // End of file cleanup

// This function has been implemented earlier in the file

// Sample match competition functions removed - no longer needed

// Helper function to update load data button state
function updateLoadDataButton() {
    const hasCompetition = competitionSelect.value && competitionSelect.value !== '';
    const hasSeason = seasonSelect.value && seasonSelect.value !== '';
    const isSeasonEnabled = !seasonSelect.disabled;
    
    loadDataBtn.disabled = !(hasCompetition && hasSeason && isSeasonEnabled);
}

// Set up event listeners
function setupEventListeners() {
    // Competition select change
    competitionSelect.addEventListener('change', (e) => {
        const competitionId = e.target.value;
        if (competitionId) {
            currentCompetition = competitionId;
            loadSeasons(competitionId);
            // Automatically load data when both competition and season are selected
            if (currentCompetition && currentSeason) {
                loadMatches(currentCompetition, currentSeason);
            }
        } else {
            // Reset season dropdown when no competition is selected
            seasonSelect.innerHTML = '<option value="" disabled selected>Select a competition first</option>';
            seasonSelect.disabled = true;
            updateLoadDataButton();
        }
    });
    
    // Season select change
    seasonSelect.addEventListener('change', (e) => {
        const seasonId = e.target.value;
        if (seasonId) {
            currentSeason = seasonId;
            // Automatically load data when both competition and season are selected
            if (currentCompetition && currentSeason) {
                loadMatches(currentCompetition, currentSeason);
            }
        }
        updateLoadDataButton();
    });
    
    // Load data button click
    loadDataBtn.addEventListener('click', () => {
        if (currentCompetition && currentSeason) {
            loadMatches(currentCompetition, currentSeason);
        }
    });
    
    // Round filter change
    roundFilter.addEventListener('change', (e) => {
        const roundValue = e.target.value;
        displayMatches(roundValue);
    });
    
    // Stat category change
    statCategory.addEventListener('change', (e) => {
        const category = e.target.value;
        if (category === 'players') {
            showPlayerSelection();
        } else {
            hidePlayerSelection();
            displayStatistics(category);
        }
    });
    
    // Player selection event listener
    playerSelect.addEventListener('change', async () => {
        const playerId = playerSelect.value;
        if (playerId && currentCompetition && currentSeason) {
            await displayPlayerHeatMap(currentCompetition, currentSeason, parseInt(playerId));
        } else {
            hideHeatMap();
        }
    });
    
    // Tab navigation
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            link.classList.add('active');
            
            // Show corresponding content
            const tabId = link.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Match list functionality removed - no longer needed
}

// Match season loading functions removed - no longer needed

// Orphaned display overview function removed

// Display statistics
function displayStatistics(category = 'goals') {
    const statisticsContainer = document.querySelector('.statistics-container');
    
    if (!matches.length) {
        statisticsContainer.innerHTML = '<p>No data available for the selected competition and season.</p>';
        return;
    }
    
    // For demo purposes, we'll create some sample statistics
    // In a real app, this would be calculated from actual match data
    
    // Create a map of teams and their stats
    const teamStats = {};
    
    matches.forEach(match => {
        // Process home team
        if (!teamStats[match.home_team]) {
            teamStats[match.home_team] = {
                goals: 0,
                possession: 0,
                passes: 0,
                shots: 0,
                matches: 0
            };
        }
        
        // Process away team
        if (!teamStats[match.away_team]) {
            teamStats[match.away_team] = {
                goals: 0,
                possession: 0,
                passes: 0,
                shots: 0,
                matches: 0
            };
        }
        
        // Update stats
        teamStats[match.home_team].goals += match.home_score;
        teamStats[match.away_team].goals += match.away_score;
        teamStats[match.home_team].matches += 1;
        teamStats[match.away_team].matches += 1;
        
        // Add random values for demo purposes
        teamStats[match.home_team].possession += Math.floor(Math.random() * 30) + 40; // 40-70%
        teamStats[match.away_team].possession += Math.floor(Math.random() * 30) + 40; // 40-70%
        teamStats[match.home_team].passes += Math.floor(Math.random() * 300) + 300; // 300-600
        teamStats[match.away_team].passes += Math.floor(Math.random() * 300) + 300; // 300-600
        teamStats[match.home_team].shots += Math.floor(Math.random() * 10) + 5; // 5-15
        teamStats[match.away_team].shots += Math.floor(Math.random() * 10) + 5; // 5-15
    });
    
    // Calculate averages
    Object.keys(teamStats).forEach(team => {
        const matches = teamStats[team].matches;
        teamStats[team].possession = Math.round(teamStats[team].possession / matches);
        teamStats[team].passes = Math.round(teamStats[team].passes / matches);
        teamStats[team].shots = Math.round(teamStats[team].shots / matches);
    });
    
    // Sort teams by selected category
    const sortedTeams = Object.keys(teamStats).sort((a, b) => {
        return teamStats[b][category] - teamStats[a][category];
    });
    
    // Create table
    let tableHTML = `
        <table class="stat-table">
            <thead>
                <tr>
                    <th>Team</th>
                    <th>${category.charAt(0).toUpperCase() + category.slice(1)}</th>
                    <th>Matches</th>
                    <th>Avg per Match</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedTeams.forEach(team => {
        const stats = teamStats[team];
        const avgPerMatch = (stats[category] / stats.matches).toFixed(2);
        
        tableHTML += `
            <tr>
                <td>${team}</td>
                <td>${stats[category]}</td>
                <td>${stats.matches}</td>
                <td>${avgPerMatch}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    statisticsContainer.innerHTML = tableHTML;
}

// Helper function to get team logo using actual PNG files
function getTeamLogo(teamName) {
    const teamLogos = {
        'Spain': '🇪🇸',
        'Portugal': '🇵🇹',
        'Belgium': '🇧🇪',
        'Netherlands': '🇳🇱',
        'France': '🇫🇷',
        'Germany': '🇩🇪',
        'Italy': '🇮🇹',
        'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        'Sweden': '🇸🇪',
        'Norway': '🇳🇴',
        'Denmark': '🇩🇰',
        'Finland': '🇫🇮',
        'Iceland': '🇮🇸',
        'Switzerland': '🇨🇭',
        'Austria': '🇦🇹',
        'Poland': '🇵🇱',
        'Czech Republic': '🇨🇿',
        'Croatia': '🇭🇷',
        'Serbia': '🇷🇸',
        'Ukraine': '🇺🇦',
        'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
        'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        'Northern Ireland': '🇬🇧',
        'Republic of Ireland': '🇮🇪',
        'Ireland': '🇮🇪',
        'Turkey': '🇹🇷',
        'Greece': '🇬🇷',
        'Hungary': '🇭🇺',
        'Romania': '🇷🇴',
        'Bulgaria': '🇧🇬',
        'Slovenia': '🇸🇮',
        'Slovakia': '🇸🇰',
        'Estonia': '🇪🇪',
        'Latvia': '🇱🇻',
        'Lithuania': '🇱🇹',
        'Cyprus': '🇨🇾',
        'Malta': '🇲🇹',
        'Luxembourg': '🇱🇺',
        'Albania': '🇦🇱',
        'North Macedonia': '🇲🇰',
        'Bosnia and Herzegovina': '🇧🇦',
        'Montenegro': '🇲🇪',
        'Moldova': '🇲🇩',
        'Belarus': '🇧🇾',
        'Georgia': '🇬🇪',
        'Armenia': '🇦🇲',
        'Azerbaijan': '🇦🇿',
        'Kazakhstan': '🇰🇿',
        'Russia': '🇷🇺',
        'Israel': '🇮🇱',
        'Faroe Islands': '🇫🇴',
        'Gibraltar': '🇬🇮',
        'Andorra': '🇦🇩',
        'San Marino': '🇸🇲',
        'Monaco': '🇲🇨',
        'Liechtenstein': '🇱🇮',
        'Kosovo': '🇽🇰'
    };
    
    const flagEmoji = teamLogos[teamName];
    if (flagEmoji) {
        return `<span class="team-flag-emoji">${flagEmoji}</span>`;
    }
    return `<span class="team-logo-fallback">${teamName.substring(0, 3).toUpperCase()}</span>`;
}

// Display overview function
function displayOverview() {
    const overviewContainer = document.querySelector('#overview-tab .overview-container');
    
    if (!matches.length) {
        overviewContainer.innerHTML = '<p>No data available for the selected competition and season.</p>';
        return;
    }
    
    // Get competition and season names
    const competitionName = getCompetitionName(currentCompetition);
    const seasonName = getSeasonName(currentSeason);
    
    // Group matches by phase and then by date within each phase
    const matchesByPhase = {};
    matches.forEach(match => {
        const phase = match.match_round || 'Unknown';
        if (!matchesByPhase[phase]) {
            matchesByPhase[phase] = [];
        }
        matchesByPhase[phase].push(match);
    });
    
    // Sort phases by phase_order, then matches within each phase by date
    const sortedPhases = Object.keys(matchesByPhase).sort((a, b) => {
        const phaseA = matchesByPhase[a][0]?.phase_order || 999;
        const phaseB = matchesByPhase[b][0]?.phase_order || 999;
        return phaseA - phaseB;
    });
    
    // Sort matches within each phase by date
    sortedPhases.forEach(phase => {
        matchesByPhase[phase].sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
    });
    
    let overviewHTML = `
        <div class="overview-content">
            <div class="competition-header">
                <div class="competition-logo">🏆</div>
                <h2>${competitionName}</h2>
                <p class="season-name">${seasonName}</p>
                <p class="match-count">${matches.length} matches</p>
            </div>
            
            <div class="matches-by-phase">
    `;
    
    sortedPhases.forEach(phase => {
        const phaseMatches = matchesByPhase[phase];
        const matchCount = phaseMatches.length;
        
        overviewHTML += `
            <div class="phase-group">
                <h3 class="phase-header">${phase} <span class="match-count-badge">${matchCount} matches</span></h3>
        `;
        
        phaseMatches.forEach(match => {
            const homeTeamLogo = getTeamLogo(match.home_team);
            const awayTeamLogo = getTeamLogo(match.away_team);
            const matchPhase = getMatchPhase(match.match_round);
            const formattedDate = new Date(match.match_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            // Build match context info
            let matchContext = formattedDate;
            if (match.group) {
                matchContext += ` • ${match.group}`;
            }
            if (match.match_day && match.match_day !== match.match_round) {
                matchContext += ` • ${match.match_day}`;
            }
            
            overviewHTML += `
                <div class="overview-match-item">
                    <div class="match-info-left">
                        <div class="match-teams-overview">
                            <div class="team-display">
                                ${homeTeamLogo}
                                <span class="team-name">${match.home_team}</span>
                            </div>
                            <span class="vs-separator">vs</span>
                            <div class="team-display">
                                ${awayTeamLogo}
                                <span class="team-name">${match.away_team}</span>
                            </div>
                        </div>
                        <div class="match-context">${matchContext}</div>
                    </div>
                    <div class="match-info-right">
                        <div class="match-score-overview">${match.home_score} - ${match.away_score}</div>
                        <div class="match-phase ${matchPhase.class}">${matchPhase.name}</div>
                    </div>
                </div>
            `;
        });
        
        overviewHTML += '</div>';
    });
    
    overviewHTML += `
            </div>
        </div>
    `;
    
    overviewContainer.innerHTML = overviewHTML;
}

// Helper function to get competition name
function getCompetitionName(competitionId) {
    // This would normally come from the competitions data
    // For now, return a default based on common competition IDs
    const competitionNames = {
        '43': 'UEFA Women\'s Euro 2025',
        '11': 'La Liga',
        '2': 'Premier League',
        '9': 'Bundesliga',
        '12': 'Serie A'
    };
    return competitionNames[competitionId] || 'Competition';
}

// Helper function to get season name
function getSeasonName(seasonId) {
    // This would normally come from the seasons data
    // For now, return a default based on common season IDs
    const seasonNames = {
        '3': '2025',
        '90': '2020/2021',
        '27': '2015/2016'
    };
    return seasonNames[seasonId] || 'Season';
}

// Helper function to get match phase with styling class
function getMatchPhase(matchRound) {
    const phaseMap = {
        'Group Stage': { name: 'Group Stage', class: 'phase-group' },
        'Round of 16': { name: 'Round of 16', class: 'phase-knockout' },
        'Quarter Final': { name: 'Quarter Final', class: 'phase-knockout' },
        'Semi Final': { name: 'Semi Final', class: 'phase-knockout' },
        'Final': { name: 'Final', class: 'phase-final' }
    };
    
    return phaseMap[matchRound] || { name: matchRound, class: 'phase-other' };
}

// Player Heat Map Functions
async function loadPlayers(competitionId, seasonId) {
    try {
        const response = await fetch(`${API_BASE_URL}/players/${competitionId}/${seasonId}`, {
            headers: getApiHeaders()
        });
        
        if (!response.ok) {
            console.warn('Failed to load players, using sample data');
            addSamplePlayers();
            return;
        }
        
        players = await response.json();
        populatePlayerSelect();
        
    } catch (error) {
        console.error('Error loading players:', error);
        addSamplePlayers();
    }
}

function addSamplePlayers() {
    players = [
        {
            player_id: 1,
            player_name: 'Lionel Messi',
            jersey_number: 10,
            position: 'Right Wing',
            team_name: 'Argentina'
        },
        {
            player_id: 2,
            player_name: 'Kylian Mbappé',
            jersey_number: 7,
            position: 'Centre-Forward',
            team_name: 'France'
        },
        {
            player_id: 3,
            player_name: 'Pedri',
            jersey_number: 8,
            position: 'Central Midfield',
            team_name: 'Spain'
        },
        {
            player_id: 4,
            player_name: 'Jamal Musiala',
            jersey_number: 14,
            position: 'Attacking Midfield',
            team_name: 'Germany'
        }
    ];
    populatePlayerSelect();
}

function populatePlayerSelect() {
    playerSelect.innerHTML = '<option value="">Choose a player...</option>';
    
    // Sort players by team and name
    const sortedPlayers = players.sort((a, b) => {
        if (a.team_name !== b.team_name) {
            return a.team_name.localeCompare(b.team_name);
        }
        return a.player_name.localeCompare(b.player_name);
    });
    
    sortedPlayers.forEach(player => {
        const option = document.createElement('option');
        option.value = player.player_id;
        option.textContent = `${player.player_name} (${player.team_name})`;
        if (player.jersey_number) {
            option.textContent += ` #${player.jersey_number}`;
        }
        playerSelect.appendChild(option);
    });
}

function showPlayerSelection() {
    playerSelection.style.display = 'block';
    document.querySelector('.statistics-container').style.display = 'none';
    
    if (!playerSelect.value) {
        hideHeatMap();
    }
}

function hidePlayerSelection() {
    playerSelection.style.display = 'none';
    document.querySelector('.statistics-container').style.display = 'block';
    hideHeatMap();
}

function hideHeatMap() {
    heatmapContainer.style.display = 'none';
}

async function displayPlayerHeatMap(competitionId, seasonId, playerId) {
    try {
        // Show loading state
        heatmapContainer.style.display = 'block';
        heatmapContainer.innerHTML = '<div class="loading-spinner">Loading heat map data...</div>';
        
        const response = await fetch(`${API_BASE_URL}/players/${competitionId}/${seasonId}/${playerId}/heatmap`, {
            headers: getApiHeaders()
        });
        
        if (!response.ok) {
            console.warn('Failed to load heat map data, using sample data');
            displaySampleHeatMap(playerId);
            return;
        }
        
        const heatMapData = await response.json();
        renderHeatMap(heatMapData);
        
    } catch (error) {
        console.error('Error loading heat map:', error);
        displaySampleHeatMap(playerId);
    }
}

function displaySampleHeatMap(playerId) {
    const player = players.find(p => p.player_id === playerId);
    if (!player) return;
    
    // Generate sample heat map data
    const sampleHeatMapData = {
        player_id: player.player_id,
        player_name: player.player_name,
        team_name: player.team_name,
        position: player.position,
        jersey_number: player.jersey_number,
        total_events: Math.floor(Math.random() * 200) + 100,
        heat_zones: generateSampleHeatZones()
    };
    
    renderHeatMap(sampleHeatMapData);
}

function generateSampleHeatZones() {
    const zones = [];
    const gridSize = 10;
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const intensity = Math.random() * 50;
            zones.push({
                x_min: (120 / gridSize) * i,
                x_max: (120 / gridSize) * (i + 1),
                y_min: (80 / gridSize) * j,
                y_max: (80 / gridSize) * (j + 1),
                x_center: (120 / gridSize) * (i + 0.5),
                y_center: (80 / gridSize) * (j + 0.5),
                intensity: intensity,
                normalized_intensity: intensity / 50
            });
        }
    }
    
    return zones;
}

function renderHeatMap(heatMapData) {
    const playerInfo = `
        <div class="player-info">
            <div>
                <h3>${heatMapData.player_name}</h3>
                <p>${heatMapData.team_name} ${heatMapData.jersey_number ? `#${heatMapData.jersey_number}` : ''}</p>
                <p><strong>Position:</strong> ${heatMapData.position || 'N/A'}</p>
            </div>
            <div class="player-stats">
                <div class="stat-item">
                    <span class="stat-value">${heatMapData.total_events}</span>
                    <span class="stat-label">Total Events</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${heatMapData.heat_zones.filter(z => z.intensity > 0).length}</span>
                    <span class="stat-label">Active Zones</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${Math.max(...heatMapData.heat_zones.map(z => Math.round(z.intensity)))}</span>
                    <span class="stat-label">Max Intensity</span>
                </div>
            </div>
        </div>
    `;
    
    const pitchHTML = `
        <div class="heatmap-pitch">
            <div class="pitch-background">
                <div class="pitch-lines">
                    <div class="pitch-line center-line"></div>
                    <div class="center-circle"></div>
                    <div class="penalty-area left"></div>
                    <div class="penalty-area right"></div>
                </div>
                ${renderHeatZones(heatMapData.heat_zones)}
            </div>
        </div>
        <div class="heat-legend">
            <div class="legend-item">
                <div class="legend-color" style="background: rgba(0, 0, 255, 0.7);"></div>
                <span>Low Activity</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: rgba(255, 255, 0, 0.7);"></div>
                <span>Medium Activity</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: rgba(255, 0, 0, 0.7);"></div>
                <span>High Activity</span>
            </div>
        </div>
    `;
    
    heatmapContainer.innerHTML = playerInfo + pitchHTML;
}

function renderHeatZones(heatZones) {
    return heatZones.map(zone => {
        if (zone.intensity === 0) return '';
        
        // Convert StatsBomb coordinates to percentage
        const left = (zone.x_min / 120) * 100;
        const top = (zone.y_min / 80) * 100;
        const width = ((zone.x_max - zone.x_min) / 120) * 100;
        const height = ((zone.y_max - zone.y_min) / 80) * 100;
        
        // Color based on intensity (blue to red gradient)
        const intensity = zone.normalized_intensity;
        let color;
        if (intensity < 0.33) {
            // Blue to yellow
            const ratio = intensity / 0.33;
            color = `rgba(${Math.round(ratio * 255)}, ${Math.round(ratio * 255)}, ${Math.round(255 - ratio * 255)}, 0.7)`;
        } else if (intensity < 0.66) {
            // Yellow to orange
            const ratio = (intensity - 0.33) / 0.33;
            color = `rgba(255, ${Math.round(255 - ratio * 128)}, 0, 0.7)`;
        } else {
            // Orange to red
            const ratio = (intensity - 0.66) / 0.34;
            color = `rgba(255, ${Math.round(127 - ratio * 127)}, 0, 0.7)`;
        }
        
        return `
            <div class="heat-zone" 
                 style="left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%; background: ${color};"
                 title="Intensity: ${Math.round(zone.intensity)} events">
            </div>
        `;
    }).join('');
}

// File cleanup completed - all orphaned code blocks removed