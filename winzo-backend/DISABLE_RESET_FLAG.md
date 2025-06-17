# Disable RESET_DATABASE Flag in Railway

## Problem
Your Railway server is crashing because the `RESET_DATABASE=true` environment variable is set, causing the database to reset on every startup. This is causing timeouts and crashes.

## Solution
You need to disable the `RESET_DATABASE` flag in your Railway project settings.

## Steps to Fix

### 1. Go to Railway Dashboard
1. Open your Railway project dashboard
2. Navigate to the "Variables" tab
3. Look for the `RESET_DATABASE` environment variable

### 2. Disable the Reset Flag
**Option A: Remove the variable entirely**
- Delete the `RESET_DATABASE` variable completely

**Option B: Set it to false**
- Change `RESET_DATABASE=true` to `RESET_DATABASE=false`

### 3. Alternative: Use Railway CLI
If you have Railway CLI installed:
```bash
railway variables set RESET_DATABASE=false
```

### 4. Redeploy
After changing the variable:
1. Go to the "Deployments" tab
2. Click "Deploy" to trigger a new deployment
3. The server should start without database reset

## Why This Happens
The `RESET_DATABASE=true` flag is useful for development/testing but should not be enabled in production. When enabled, it:
- Drops all tables on every startup
- Recreates the schema
- Creates test users
- Takes a long time to complete
- Can cause Railway timeouts

## Verification
After disabling the flag, you should see in the logs:
- No "RESET_DATABASE flag detected" message
- Faster startup times
- No database reset operations
- Server starts within 30-60 seconds

## If You Need to Reset Database
If you need to reset the database in the future:
1. Temporarily set `RESET_DATABASE=true`
2. Deploy once
3. Immediately set it back to `false`
4. Deploy again

This way you only reset when needed, not on every startup. 