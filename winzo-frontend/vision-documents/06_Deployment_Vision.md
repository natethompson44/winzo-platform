# 06 Deployment Vision

## Purpose
This document outlines the deployment strategy and version control best practices for Winzo's front-end.

## Git Workflow
- Branching: Main for production, feature branches (e.g., feature/styling) for development. Merge via pull requests.
- Commit Messages: Descriptive, e.g., "feat: Add button components" or "docs: Update vision doc".

## Netlify Deployment
- Continuous Deployment: Link repo to Netlify for auto-builds on main pushes.
- Domain Setup: Use Netlify's free subdomain initially, then add custom (e.g., winzo.app) via DNS.
- Build Settings: No build command needed; serve static files from root.

## Environment Variables
Anticipate vars like API_URL for future backend (set in Netlify dashboard, accessed via process.env in JS).