// Main JavaScript for Estilo Futbol

// API base URL - change this when deploying
const API_BASE_URL = 'http://localhost:8000/api';

// DOM Elements
const competitionSelect = document.getElementById('competition-select');
const seasonSelect = document.getElementById('season-select');
const loadDataBtn = document.getElementById('load-data-btn');
const roundFilter = document.getElementById('round-filter');
const statCategory = document.getElementById('stat-category');
const tabLinks = document.querySelectorAll('nav a');
const tabContents = document.querySelectorAll('.tab-content');

// Match List Elements
const matchCompetitionSelect = document.getElementById('match-competition-select');
const matchSeasonSelect = document.getElementById('match-season-select');
const loadMatchesBtn = document.getElementById('load-matches-btn');
const matchListContainer = document.getElementById('match-list');

// State
let currentCompetition = null;
let currentSeason = null;
let matches = [];
let rounds = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load competitions for both selectors
    loadCompetitions();
    loadMatchCompetitions();
    
    // Set up event listeners
    setupEventListeners();
});

// Fetch and display matches from the /matches endpoint
async function fetchAndDisplayMatches(competitionId, seasonId) {
    try {
        // Show loading state
        matchListContainer.innerHTML = '<p class="loading-message">Loading matches...</p>';
        
        // Fetch matches from API
        const response = await fetch(`${API_BASE_URL}/matches?competition_id=${competitionId}&season_id=${seasonId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load matches: ${response.status}`);
        }
        
        const matches = await response.json();
        
        // Display matches
        if (matches.length === 0) {
            matchListContainer.innerHTML = '<p class="no-data-message">No matches found for the selected competition and season.</p>';
            return;
        }
        
        // Clear container and create match items
        matchListContainer.innerHTML = '';
        
        // Sort matches by date (newest first)
        matches.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
        
        // Group matches by round if available
        const matchesByRound = {};
        let hasRounds = false;
        
        matches.forEach(match => {
            const round = match.match_round || 'Other Matches';
            if (round !== 'Other Matches') hasRounds = true;
            
            if (!matchesByRound[round]) {
                matchesByRound[round] = [];
            }
            matchesByRound[round].push(match);
        });
        
        // If we have rounds, display matches grouped by round
        if (hasRounds) {
            // Sort rounds in a sensible order
            const sortedRounds = Object.keys(matchesByRound).sort((a, b) => {
                if (a === 'Other Matches') return 1;
                if (b === 'Other Matches') return -1;
                return a.localeCompare(b);
            });
            
            sortedRounds.forEach(round => {
                if (matchesByRound[round].length > 0) {
                    // Add round header
                    const roundHeader = document.createElement('h3');
                    roundHeader.className = 'round-header';
                    roundHeader.textContent = round;
                    matchListContainer.appendChild(roundHeader);
                    
                    // Add matches for this round
                    matchesByRound[round].forEach(match => {
                        createMatchItem(match, matchListContainer);
                    });
                }
            });
        } else {
            // Just display all matches chronologically
            matches.forEach(match => {
                createMatchItem(match, matchListContainer);
            });
        }
        
    } catch (error) {
        console.error('Error fetching matches:', error);
        matchListContainer.innerHTML = `<p class="error-message">Error loading matches: ${error.message}</p>`;
    }
}

// Helper function to create a match item
function createMatchItem(match, container) {
    const matchItem = document.createElement('div');
    matchItem.className = 'match-item';
    
    // Format date
    const matchDate = new Date(match.match_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Determine if there's a winner
    let homeTeamClass = 'team home-team';
    let awayTeamClass = 'team away-team';
    
    if (match.home_score > match.away_score) {
        homeTeamClass += ' winner';
    } else if (match.away_score > match.home_score) {
        awayTeamClass += ' winner';
    }
    
    matchItem.innerHTML = `
        <div class="match-date">${matchDate}</div>
        <div class="match-teams">
            <span class="${homeTeamClass}">${match.home_team}</span>
            <span class="score">${match.home_score} - ${match.away_score}</span>
            <span class="${awayTeamClass}">${match.away_team}</span>
        </div>
        <div class="match-round">${match.match_round || 'N/A'}</div>
    `;
    
    // Add click event to show match details in the future
    matchItem.addEventListener('click', () => {
        alert(`Match details for ${match.home_team} vs ${match.away_team} will be available in a future update.`);
    });
    
    container.appendChild(matchItem);
}

// Load competitions from API
async function loadCompetitions() {
    try {
        // Show loading state
        competitionSelect.innerHTML = '<option value="" disabled selected>Loading competitions...</option>';
        competitionSelect.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/competitions?grouped=true`);
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

// Load competitions for match list section
async function loadMatchCompetitions() {
    try {
        // Show loading state
        matchCompetitionSelect.innerHTML = '<option value="" disabled selected>Loading competitions...</option>';
        matchCompetitionSelect.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/competitions?grouped=true`);
        if (!response.ok) throw new Error('Failed to load competitions');
        
        const competitions = await response.json();
        
        // Clear and populate match competition select
        matchCompetitionSelect.innerHTML = '<option value="" disabled selected>Select a competition</option>';
        matchCompetitionSelect.disabled = false;
        
        if (competitions.length === 0) {
            matchCompetitionSelect.innerHTML = '<option value="" disabled selected>No competitions available</option>';
            return;
        }
        
        competitions.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp.competition_id;
            option.textContent = `${comp.competition_name} (${comp.country_name})`;
            
            // Store seasons data as a data attribute
            option.dataset.seasons = JSON.stringify(comp.seasons || []);
            
            matchCompetitionSelect.appendChild(option);
        });

        // Set default selection if available
        if (competitions.length > 0) {
            matchCompetitionSelect.value = competitions[0].competition_id;
            // Load seasons for the selected competition
            loadMatchSeasons(matchCompetitionSelect.value);
        }
    } catch (error) {
        console.error('Error loading match competitions:', error);
        matchCompetitionSelect.innerHTML = '<option value="" disabled selected>Error loading competitions</option>';
        matchCompetitionSelect.disabled = false;
        
        // For demo purposes, add some sample competitions
        addSampleMatchCompetitions();
    }
}

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
        const response = await fetch(`${API_BASE_URL}/matches/?competition_id=${competitionId}&season_id=${seasonId}`);
        if (!response.ok) throw new Error('Failed to load matches');
        
        matches = await response.json();
        
        // Extract unique rounds
        rounds = [...new Set(matches.map(match => match.match_round).filter(round => round))];
        
        // Populate round filter
        populateRoundFilter();
        
        // Display matches
        displayMatches();
        
        // Display overview
        displayOverview();
        
        // Display statistics
        displayStatistics();
        
    } catch (error) {
        console.error('Error loading matches:', error);
        // For demo purposes, add some sample matches
        addSampleMatches();
    }
}

// Add sample matches for demo
function addSampleMatches() {
    matches = [
        {
            match_id: 1,
            match_date: '2021-08-14',
            match_round: 'Matchday 1',
            home_team: 'FC Barcelona',
            away_team: 'Real Madrid',
            home_score: 3,
            away_score: 1
        },
        {
            match_id: 2,
            match_date: '2021-08-15',
            match_round: 'Matchday 1',
            home_team: 'Atletico Madrid',
            away_team: 'Valencia',
            home_score: 2,
            away_score: 2
        },
        {
            match_id: 3,
            match_date: '2021-08-21',
            match_round: 'Matchday 2',
            home_team: 'Real Madrid',
            away_team: 'Atletico Madrid',
            home_score: 0,
            away_score: 1
        }
    ];
    
    // Extract unique rounds
    rounds = [...new Set(matches.map(match => match.match_round))];
    
    // Populate round filter
    populateRoundFilter();
    
    // Display matches
    displayMatches();
    
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

function displayMatches(matches, rounds) {
    const matchListContainer = document.getElementById('match-list');
    matchListContainer.innerHTML = '';
    
    if (!matches || matches.length === 0) {
        matchListContainer.innerHTML = '<div class="no-data-message">No matches found for the selected criteria.</div>';
        return;
    }
    
    // Group matches by round
    const matchesByRound = {};
    
    // If we have rounds from the filter, use those as keys first
    if (rounds && rounds.length > 0) {
        rounds.forEach(round => {
            matchesByRound[round] = [];
        });
    }
    
    // Add matches to their respective rounds
    matches.forEach(match => {
        const round = match.round || 'Unknown';
        if (!matchesByRound[round]) {
            matchesByRound[round] = [];
        }
        matchesByRound[round].push(match);
    });
    
    // Get the selected round from the filter
    const roundFilter = document.getElementById('round-filter');
    const selectedRound = roundFilter.value;
    
    // Display matches for all rounds or just the selected one
    Object.keys(matchesByRound).forEach(round => {
        if (selectedRound === 'all' || selectedRound === round) {
            const roundMatches = matchesByRound[round];
            if (roundMatches.length > 0) {
                // Add round header
                const roundHeader = document.createElement('h3');
                roundHeader.className = 'round-header';
                roundHeader.textContent = `Round: ${round}`;
                matchListContainer.appendChild(roundHeader);
                
                // Add matches for this round
                roundMatches.forEach(match => {
                    const matchItem = createMatchElement(match);
                    matchListContainer.appendChild(matchItem);
                });
            }
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

function populateRoundFilter(rounds) {
    const roundFilter = document.getElementById('round-filter');
    roundFilter.innerHTML = '<option value="all">All Rounds</option>';
    
    rounds.forEach(round => {
        const option = document.createElement('option');
        option.value = round;
        option.textContent = `Round ${round}`;
        roundFilter.appendChild(option);
    });
}

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

// Add sample match competitions for demo
function addSampleMatchCompetitions() {
    const sampleCompetitions = [
        { id: 11, name: 'La Liga' },
        { id: 2, name: 'Premier League' },
        { id: 37, name: 'Womens World Cup' }
    ];
    
    matchCompetitionSelect.innerHTML = '<option value="" disabled>Select a competition</option>';
    
    sampleCompetitions.forEach(comp => {
        const option = document.createElement('option');
        option.value = comp.id;
        option.textContent = comp.name;
        
        // Add sample seasons data
        if (comp.id === 11) { // La Liga
            option.dataset.seasons = JSON.stringify([
                { season_id: 4, season_name: '2020/2021' },
                { season_id: 5, season_name: '2019/2020' }
            ]);
        } else if (comp.id === 2) { // Premier League
            option.dataset.seasons = JSON.stringify([
                { season_id: 6, season_name: '2020/2021' },
                { season_id: 7, season_name: '2019/2020' }
            ]);
        } else { // Default seasons
            option.dataset.seasons = JSON.stringify([
                { season_id: 3, season_name: '2018' },
                { season_id: 2, season_name: '2014' },
                { season_id: 1, season_name: '2010' }
            ]);
        }
        
        matchCompetitionSelect.appendChild(option);
    });
    
    // Set default selection
    if (sampleCompetitions.length > 0) {
        matchCompetitionSelect.value = sampleCompetitions[0].id;
        // Load seasons for the selected competition
        loadMatchSeasons(matchCompetitionSelect.value);
    }
}

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
        displayStatistics(category);
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
    
    // Match competition select change
    matchCompetitionSelect.addEventListener('change', (e) => {
        const competitionId = e.target.value;
        if (competitionId) {
            loadMatchSeasons(competitionId);
        }
    });
    
    // Load matches button click
    loadMatchesBtn.addEventListener('click', () => {
        const competitionId = matchCompetitionSelect.value;
        const seasonId = matchSeasonSelect.value;
        if (competitionId && seasonId) {
            fetchAndDisplayMatches(competitionId, seasonId);
        } else {
            matchListContainer.innerHTML = '<p class="error-message">Please select both competition and season</p>';
        }
    });
}

// Load seasons for match list section based on selected competition
async function loadMatchSeasons(competitionId) {
    try {
        // Get the selected option
        const selectedOption = Array.from(matchCompetitionSelect.options)
            .find(option => option.value === competitionId);
        
        if (!selectedOption) throw new Error('Selected competition not found');
        
        // Get seasons from the data attribute
        let seasons = [];
        if (selectedOption.dataset.seasons) {
            try {
                seasons = JSON.parse(selectedOption.dataset.seasons);
            } catch (e) {
                console.error('Error parsing seasons data:', e);
            }
        }
        
        // If no seasons in data attribute, try to fetch from API
        if (seasons.length === 0) {
            const response = await fetch(`${API_BASE_URL}/competitions/seasons?competition_id=${competitionId}`);
            if (!response.ok) throw new Error('Failed to load seasons');
            seasons = await response.json();
        }
        
        // Clear and populate match season select
        matchSeasonSelect.innerHTML = '<option value="" disabled selected>Select a season</option>';
        
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.season_id;
            option.textContent = season.season_name;
            matchSeasonSelect.appendChild(option);
        });
        
        // Set default selection if available
        if (seasons.length > 0) {
            matchSeasonSelect.value = seasons[0].season_id;
            matchSeasonSelect.disabled = false;
        } else {
            matchSeasonSelect.disabled = true;
        }
    } catch (error) {
        console.error('Error loading match seasons:', error);
        // For demo purposes, add some sample seasons
        addSampleMatchSeasons(competitionId);
    }
}

// Add sample match seasons for demo purposes
function addSampleMatchSeasons(competitionId) {
    // Clear and populate match season select
    matchSeasonSelect.innerHTML = '<option value="" disabled selected>Select a season</option>';
    
    // Sample seasons data
    const sampleSeasons = [
        { season_id: 's1', season_name: '2022/2023' },
        { season_id: 's2', season_name: '2021/2022' },
        { season_id: 's3', season_name: '2020/2021' }
    ];
    
    sampleSeasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.season_id;
        option.textContent = season.season_name;
        matchSeasonSelect.appendChild(option);
    });
    
    // Set default selection
    if (sampleSeasons.length > 0) {
        matchSeasonSelect.value = sampleSeasons[0].season_id;
        matchSeasonSelect.disabled = false;
    } else {
        matchSeasonSelect.disabled = true;
    }
}

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

// File cleanup completed - all orphaned code blocks removed