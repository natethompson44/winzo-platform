# WINZO Platform - Current Project Structure

**Date:** June 20, 2025  
**Branch:** `feature/design-system-overhaul`  
**Status:** Foundation Complete - Ready for Development

```
winzo-platform/
├── .cursor/
│   └── rules/
│       ├── component-development.mdc
│       ├── document-references.mdc
│       └── systematic-changes.mdc
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── .gitignore
├── .vscode/
│   └── settings.json
├── _OverhaulTempref/
│   └── NiceAdmin-pro/
│       ├── assets/
│       │   ├── css/
│       │   ├── img/
│       │   ├── js/
│       │   ├── scss/
│       │   └── vendor/
│       ├── forms/
│       └── [50+ HTML template files]
├── docs/
│   ├── DEPLOYMENT.md
│   ├── DESIGN_PHILOSOPHY.md
│   ├── DESIGN_QUICK_REFERENCE.md
│   ├── INDEX.md
│   ├── MIME_TYPE_FIX.md
│   ├── NETLIFY_DEPLOYMENT_FIX.md
│   ├── NETLIFY_TYPESCRIPT_FIX.md
│   ├── README.md
│   ├── WINZO_FIXES_SUMMARY.md
│   ├── WINZO_MOBILE_OPTIMIZATION_SUMMARY.md
│   └── WINZO_UX_UI_IMPROVEMENTS_IMPLEMENTED.md
├── preserved_components/
│   ├── components/
│   │   ├── BetItem.tsx
│   │   ├── BetslipPanel.css
│   │   ├── BetslipPanel.tsx
│   │   ├── BetslipTrigger.css
│   │   ├── BetslipTrigger.tsx
│   │   ├── HomePage.tsx
│   │   ├── index.ts
│   │   ├── Login.tsx
│   │   ├── PayoutDisplay.tsx
│   │   ├── Register.tsx
│   │   ├── StakeInput.tsx
│   │   ├── ValidationDisplay.css
│   │   └── ValidationDisplay.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── BetSlipContext.tsx
│   ├── config/
│   │   └── api.ts
│   ├── utils/
│   │   ├── axios.ts
│   │   ├── bettingRules.ts
│   │   ├── constants.ts
│   │   └── validationUtils.ts
│   ├── env/
│   │   ├── .env
│   │   └── .env.example
│   ├── styles/
│   │   └── HomePage.css
│   └── PRESERVATION_DOCUMENTATION.md
├── project-docs/
│   ├── complete_overhaul_roadmap.md
│   ├── css_variables_components.md
│   ├── migration_strategy.md
│   └── winzo_design_system.md
├── scripts/
│   ├── deploy-production.ps1
│   ├── deploy-production.sh
│   ├── rebuild-and-deploy.ps1
│   └── rebuild-and-deploy.sh
├── winzo-backend/
│   ├── config/
│   ├── src/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.js
│   ├── tests/
│   ├── package.json
│   └── [backend configuration files]
├── winzo-frontend/
│   ├── public/
│   │   ├── _redirects
│   │   ├── cache-buster.js
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── offline.html
│   │   └── sw.js
│   ├── src/
│   │   ├── assets/
│   │   │   └── winzo-logo.png
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Card/
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Form/
│   │   │   │   └── Navigation/
│   │   │   ├── sports/
│   │   │   │   ├── BetSlip/
│   │   │   │   ├── GameCard/
│   │   │   │   └── OddsButton/
│   │   │   ├── layout/
│   │   │   │   ├── BaseLayout.tsx
│   │   │   │   ├── Header/
│   │   │   │   ├── MobileNav/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   ├── design-system/
│   │   │   │   ├── variables.css
│   │   │   │   ├── base.css
│   │   │   │   └── components.css
│   │   │   └── globals.css
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   │   └── components.ts
│   │   ├── pages/
│   │   └── index.tsx
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
├── netlify.toml
├── FOUNDATION_COMPLETE.md
├── PROJECT_CLEANUP_COMPLETE.md
├── PROJECT_STRUCTURE.md
└── STEP_2_3_4_COMPLETION_SUMMARY.md
```

## 📊 **Project Statistics**

### **Frontend Structure**
- **Components:** Modern architecture with UI, Sports, Layout categories
- **Styles:** Complete CSS variables system with design tokens
- **Types:** TypeScript interfaces for component library
- **Assets:** WINZO logo and static files preserved

### **Preserved Components**
- **22+ files** safely backed up in `preserved_components/`
- **Complete authentication system** ready for integration
- **Full betting slip functionality** preserved
- **API configurations** and utilities maintained

### **Documentation**
- **4 essential planning docs** in `project-docs/`
- **Comprehensive preservation guide** with integration instructions
- **Complete cleanup and foundation documentation**

### **Infrastructure**
- **Clean organized structure** with 12 main directories
- **Professional deployment scripts** organized in `scripts/`
- **Complete backend system** untouched and ready
- **Build tools and configurations** intact

## 🎯 **Status**

**✅ Foundation Complete:** Ready for modern development with clean architecture  
**✅ Zero Risk:** Complete backup and rollback capability maintained  
**✅ Professional Setup:** Industry-standard project organization  
**✅ Development Ready:** All tools and dependencies configured  

---

*Generated on June 20, 2025 - Branch: feature/design-system-overhaul* 