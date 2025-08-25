# 02 Styling Vision

## Purpose
This document outlines the aesthetic and functional goals for Winzo's visual design, ensuring a consistent and appealing user interface.

## Brand Identity (Winzo)
Winzo aims for a modern, sleek, energetic, and trustworthy look. The design evokes excitement (energetic colors) while maintaining professionalism (clean lines, trustworthy typography) to build user confidence in betting.

## Color Palette
- Primary: #007BFF (blue) - For main CTAs like "Place Bet".
- Secondary: #6C757D (gray) - For subdued elements like navigation.
- Accent: #28A745 (green) - For positive indicators like winning odds.
- Neutral: #F8F9FA (light gray) - Backgrounds for readability.
- Text Dark: #212529 - Main text.
- Text Light: #FFFFFF - On dark backgrounds.
- Error: #DC3545 (red) - For warnings or negative states.

Use CSS variables (e.g., --primary) for easy theme updates.

## Typography
- Primary Font: Arial (sans-serif) for body text - Clean and readable.
- Secondary Font: Helvetica (sans-serif) for headings - Bold and modern.
- Font Weights: Regular (400) for body, Bold (700) for headings.
- Typographic Scale: Base 16px, with rem units for scalability (e.g., h1: 2.5rem).

## Spacing & Layout
- Margins/Padding: Use a rhythm of 1rem multiples (e.g., 0.5rem, 1rem, 2rem) for consistency.
- Content Alignment: Center for heroes, left for text-heavy areas.
- Whitespace: Ample padding (1rem min) to prevent clutter.

## Responsiveness
Mobile-first approach: Base styles for <768px, media queries for larger screens (e.g., @media (min-width: 768px) { ... }). Use fluid units (%, vw) for adaptability.