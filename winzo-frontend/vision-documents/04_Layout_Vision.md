# 04 Layout Vision

## Purpose
This document describes the structural organization of content on Winzo pages, ensuring flexible and responsive layouts.

## Navigation Structure
- Hierarchy: Top-level links (Home, Sports, Account/Login/Logout).
- User States: Swap links based on authentication (e.g., Login for out, Account/Logout for in).
- Mobile: Hamburger menu toggles nav-menu visibility via JS.

## Grid System
12-column CSS Grid with responsive breakpoints. Gaps of 1rem for spacing. Fluid max-width for centering.

## Content Blocks
Sections use .container for wrapping. Hero sections span full width; events use grid for alignment.

## Sidebar/Main Content Split
Main content spans 8 columns (primary focus), sidebar 4 (secondary like promotions). Stacks vertically on mobile for usability.