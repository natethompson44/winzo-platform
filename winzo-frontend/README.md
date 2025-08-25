# Winzo - Sports Betting Platform Front-End

## Project Overview
Winzo is a modern, responsive sports betting platform built with vanilla HTML, CSS, and JavaScript. The platform emphasizes modularity, reusability, and maintainability to support scalable sports betting operations.

## Technology Stack
- **HTML5** - Semantic structure and accessibility
- **CSS3** - Modern styling with Flexbox, Grid, and CSS variables
- **Vanilla JavaScript** - Lightweight interactivity without frameworks
- **Mobile-first responsive design** - Optimized for all device sizes

## Project Structure
```
winzo-frontend/
├── index.html              # Main landing page with component examples
├── sport_template.html     # Template for individual sport pages
├── style.css              # Global styles and component library
├── script.js              # JavaScript functionality
├── README.md              # Project documentation
└── vision-documents/      # Architectural and design specifications
    ├── 01_Project_Vision.md
    ├── 02_Styling_Vision.md
    ├── 03_Components_Vision.md
    ├── 04_Layout_Vision.md
    ├── 05_Sports_Page_Vision.md
    └── 06_Deployment_Vision.md
```

## Features
- **Responsive Navigation** - Desktop menu with mobile hamburger toggle
- **Component Library** - Reusable buttons, forms, and layout components
- **Grid System** - 12-column CSS Grid for flexible layouts
- **Sports Templates** - Scalable templates for different sports
- **Mobile-First Design** - Optimized for small screens with progressive enhancement

## Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local development server (optional but recommended)

### Quick Start
1. Clone or download the repository
2. Open `index.html` in your web browser
3. For development, use a local server:
   - **Python**: `python -m http.server 8000`
   - **Node.js**: `npx serve .`
   - **VS Code**: Use Live Server extension

### Development Server (PowerShell)
```powershell
# Navigate to project directory
cd winzo-frontend

# Start Python server (if available)
python -m http.server 8000

# Or use Node.js serve (if available)
npx serve .
```

## Development Guidelines

### Code Style
- Use semantic HTML5 elements
- Follow BEM methodology for CSS classes
- Use CSS variables for consistent theming
- Mobile-first responsive design
- Ensure accessibility with proper ARIA attributes

### CSS Architecture
- Global resets and base styles
- CSS variables for colors, typography, and spacing
- Component-based styling with reusable classes
- Responsive breakpoints: 768px (tablet), 1024px (desktop)

### JavaScript Guidelines
- Vanilla JavaScript only (no frameworks)
- Modular function organization
- Event-driven architecture
- Progressive enhancement approach

### Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Component Library

### Buttons
- `.btn` - Base button class
- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary action buttons
- `.btn-outline` - Outline style buttons
- Size variants: `.btn-small`, `.btn-large`
- States: hover, focus, active, disabled

### Forms
- `.form-input` - Text input fields
- `.form-group` - Form field containers
- `.form-checkbox` - Checkbox inputs
- `.checkbox-label` - Checkbox label styling

### Layout
- `.container` - Content wrapper with max-width
- `.grid-demo` - 12-column grid system
- `.sports-grid` - Sports card layout
- Responsive breakpoints for mobile/desktop

## Deployment

### Netlify Deployment
1. Connect your Git repository to Netlify
2. Set build settings:
   - Build command: (none required)
   - Publish directory: `winzo-frontend/`
3. Deploy automatically on Git pushes

### Environment Variables
- `API_URL` - Backend API endpoint (future use)
- Set in Netlify dashboard for production

## Future Enhancements
- Backend API integration
- Real-time odds updates
- User authentication system
- Live betting features
- Advanced filtering and search
- Multi-language support

## Contributing
1. Follow the established code style
2. Test on multiple devices and browsers
3. Ensure accessibility compliance
4. Update documentation for new features

## License
This project is proprietary to Winzo. All rights reserved.

## Support
For development questions or issues, refer to the vision documents or contact the development team.