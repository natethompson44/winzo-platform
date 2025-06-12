# Sports API Documentation

## Overview
The Sports API provides access to live sports data from The Odds API, including sports listings, odds, scores, and participant information.

## Base URL
`/api/sports`

## Endpoints

### GET /api/sports
Get all available sports.

**Query Parameters:**
- `include_inactive` (boolean): Include inactive sports (default: `false`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "americanfootball_nfl",
      "title": "NFL",
      "group": "American Football",
      "active": true,
      "icon": " ",
      "category": "US Sports",
      "popularity": 10
    }
  ],
  "count": 51,
  "quota": {
    "used": 10,
    "remaining": 490,
    "total": 500,
    "percentUsed": 2
  },
  "timestamp": "2025-06-12T10:30:00.000Z"
}
```

### GET /api/sports/:sport/odds
Get odds for a specific sport.

**Path Parameters:**
- `sport` (string): Sport key from sports list

**Query Parameters:**
- `regions` (string): Comma-separated regions (default: "us")
- `markets` (string): Comma-separated markets (default: "h2h")
- `bookmakers` (string): Comma-separated bookmaker keys
- `limit` (number): Maximum number of events to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "event_123",
      "sport_key": "americanfootball_nfl",
      "commence_time": "2025-06-15T20:00:00Z",
      "home_team": "Dallas Cowboys",
      "away_team": "Philadelphia Eagles",
      "bookmakers": [
        {
          "key": "draftkings",
          "title": "DraftKings",
          "markets": [
            {
              "key": "h2h",
              "outcomes": [
                { "name": "Dallas Cowboys", "price": 150 },
                { "name": "Philadelphia Eagles", "price": -180 }
              ]
            }
          ]
        }
      ],
      "timing": {
        "date": "6/15/2025",
        "time": "8:00 PM",
        "hoursFromNow": 72,
        "isLive": false,
        "isUpcoming": true
      },
      "featured": true,
      "markets_count": 3
    }
  ],
  "count": 15,
  "sport": "americanfootball_nfl",
  "markets": ["h2h"],
  "quota": {
    "used": 12,
    "remaining": 488,
    "total": 500,
    "percentUsed": 2
  },
  "timestamp": "2025-06-12T10:30:00.000Z"
}
```

### GET /api/sports/:sport/scores
Get scores for a specific sport.

**Path Parameters:**
- `sport` (string): Sport key from sports list

**Query Parameters:**
- `daysFrom` (number): Days from today to include (default: 1)
- `completed_only` (boolean): Only completed games (default: false)
- `live_only` (boolean): Only live games (default: false)

### GET /api/sports/:sport/participants
Get participants (teams/players) for a specific sport.

**Path Parameters:**
- `sport` (string): Sport key from sports list

### GET /api/sports/:sport/events/:eventId
Get detailed information for a specific event.

**Path Parameters:**
- `sport` (string): Sport key from sports list
- `eventId` (string): Event ID from odds/scores data

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid sport key format"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "API quota exceeded",
  "quota": {
    "used": 500,
    "remaining": 0,
    "total": 500,
    "percentUsed": 100
  },
  "message": "Please try again later when quota resets"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch sports data",
  "message": "Network timeout",
  "quota": {
    "used": 15,
    "remaining": 485,
    "total": 500,
    "percentUsed": 3
  }
}
```

## Rate Limiting
- 500 requests per month
- Quota is shared across all endpoints that consume it
- Sports and participants endpoints do not consume quota
- Odds and scores endpoints consume quota

## Caching
- Sports data: 24 hours
- Odds data: 30 seconds
- Scores data: 15 seconds
- Participants data: 24 hours
