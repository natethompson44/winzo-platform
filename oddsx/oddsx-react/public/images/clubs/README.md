# Club Logos Directory

This directory contains team logos organized by sport for use in the WINZO sports betting platform.

## Directory Structure

```
clubs/
├── nfl/                    # NFL team logos (32 teams)
├── nba/                    # NBA team logos (30 teams)
├── epl/                    # EPL team logos (20 teams)
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

## Future Expansion

This directory structure can accommodate additional sports and leagues:
- `mlb/` - MLB team logos  
- `nhl/` - NHL team logos
- `laliga/` - La Liga team logos
- `bundesliga/` - Bundesliga team logos
- `seriea/` - Serie A team logos
- `ligue1/` - Ligue 1 team logos
- `champions-league/` - Champions League team logos
- etc.

## Notes

- All logos are in PNG format for optimal web performance
- High resolution (500px) suitable for both desktop and mobile displays
- Logos are sourced from official ESPN feeds to ensure quality and licensing compliance
- Fallback to `default-team.png` for any missing team logos 