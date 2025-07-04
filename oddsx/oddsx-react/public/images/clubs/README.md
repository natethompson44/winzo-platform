# Club Logos Directory

This directory contains team logos organized by sport for use in the WINZO sports betting platform.

## Directory Structure

```
clubs/
├── nfl/                    # NFL team logos (32 teams) ✅ COMPLETE
├── nba/                    # NBA team logos (30 teams) ✅ COMPLETE
├── nhl/                    # NHL team logos (32 teams) ✅ COMPLETE
├── mlb/                    # MLB team logos (30 teams) ✅ COMPLETE
├── epl/                    # EPL team logos (20 teams) ✅ COMPLETE
├── champions-league/       # UEFA Champions League (36 teams) ✅ COMPLETE
├── mls/                    # Major League Soccer (30 teams) ✅ COMPLETE
├── [25+ other leagues]     # Ready for expansion
├── default-team.png        # Fallback logo for teams without specific logos
└── README.md              # This file
```

## NFL Logos

Located in `nfl/` directory:
- **Format**: PNG images in high resolution (500px from ESPN)
- **Naming**: Kebab-case team names (e.g., `buffalo-bills.png`)
- **Source**: ESPN official team logos
- **Total**: 32 teams for 2025 season

## NBA Logos

Located in `nba/` directory:
- **Format**: PNG images in high resolution (500px from ESPN)
- **Naming**: Kebab-case team names (e.g., `boston-celtics.png`)
- **Source**: ESPN official team logos
- **Total**: 30 teams for 2024-25 season

## EPL Logos

Located in `epl/` directory:
- **Format**: PNG images in high resolution (500px from ESPN)
- **Naming**: Kebab-case team names (e.g., `arsenal.png`)
- **Source**: ESPN official team logos
- **Total**: 20 teams for 2024-25 season

## NHL Logos ✅ NEW

Located in `nhl/` directory:
- **Format**: PNG images in high resolution from ESPN
- **Naming**: Kebab-case team names (e.g., `boston-bruins.png`)
- **Source**: ESPN official team logos via live API
- **Total**: 32 teams for 2024-25 season

## MLB Logos ✅ NEW

Located in `mlb/` directory:
- **Format**: PNG images in high resolution from ESPN
- **Naming**: Kebab-case team names (e.g., `new-york-yankees.png`)
- **Source**: ESPN official team logos via live API
- **Total**: 30 teams for 2025 season

## Champions League Logos ✅ NEW

Located in `champions-league/` directory:
- **Format**: PNG images in high resolution from ESPN
- **Naming**: Kebab-case team names (e.g., `real-madrid.png`)
- **Source**: ESPN official team logos via live API
- **Total**: 36 teams for 2024-25 season

## MLS Logos ✅ NEW

Located in `mls/` directory:
- **Format**: PNG images in high resolution from ESPN
- **Naming**: Kebab-case team names (e.g., `la-galaxy.png`)
- **Source**: ESPN official team logos via live API
- **Total**: 30 teams for 2025 season

### Team Mapping

Each sport directory contains a `team-mapping.json` file with complete mappings:
- **NFL**: Team codes (e.g., "BUF", "MIA") to filenames and ESPN IDs
- **NBA**: Team codes (e.g., "BOS", "LAL") to filenames and ESPN IDs  
- **EPL**: Team codes (e.g., "ARS", "CHE") to filenames and ESPN IDs

### Usage Examples

```javascript
// Get team logo path by sport and team code
const getTeamLogo = (sport, teamCode, teamMapping) => {
  return `/images/clubs/${sport}/${teamMapping[teamCode]?.filename || 'default-team.png'}`;
};

// Examples:
const billsLogo = getTeamLogo('nfl', 'BUF', nflMapping); // NFL
const celtics = getTeamLogo('nba', 'BOS', nbaMapping);   // NBA
const arsenal = getTeamLogo('epl', 'ARS', eplMapping);   // EPL
```

## Complete Sports Directory Structure

This directory now includes all sports folders for future expansion:

### Major Sports (API Supported)
- `nfl/` - NFL team logos (32 teams) ✅ COMPLETE
- `nba/` - NBA team logos (30 teams) ✅ COMPLETE  
- `epl/` - EPL team logos (20 teams) ✅ COMPLETE
- `nhl/` - NHL team logos (ready for expansion)
- `mlb/` - MLB team logos (ready for expansion)
- `tennis/` - Tennis tournament logos
- `cricket/` - Cricket team logos
- `boxing/` - Boxing organization logos
- `mma/` - MMA organization logos
- `aussie-rules/` - AFL team logos

### Soccer Leagues
- `epl/` - English Premier League ✅ COMPLETE
- `laliga/` - Spanish La Liga
- `bundesliga/` - German Bundesliga  
- `seriea/` - Italian Serie A
- `ligue1/` - French Ligue 1
- `champions-league/` - UEFA Champions League
- `mls/` - Major League Soccer

### Specialty Sports
- `rugby/` - Rugby team logos
- `waterpolo/` - Water polo team logos
- `handball/` - Handball team logos
- `volleyball/` - Volleyball team logos
- `cycling/` - Cycling team/event logos
- `darts/` - Darts player/organization logos
- `table-tennis/` - Table tennis player logos
- `squash/` - Squash player logos
- `wrestling/` - Wrestling organization logos
- `floorball/` - Floorball team logos
- `futsal/` - Futsal team logos
- `kabaddi/` - Kabaddi team logos
- `esports/` - eSports team logos
- `golf/` - Golf tournament logos

## Notes

- All logos are in PNG format for optimal web performance
- High resolution (500px) suitable for both desktop and mobile displays
- Logos are sourced from official ESPN feeds to ensure quality and licensing compliance
- Fallback to `default-team.png` for any missing team logos 