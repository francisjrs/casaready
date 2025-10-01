# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development Workflow
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build application for production
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking

### Code Quality & Linting
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Setup Commands
- `npm run prepare` - Set up Husky Git hooks (run after cloning)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **TypeScript**: Strict mode enabled with path aliases
- **Forms**: React Hook Form with Zod validation
- **AI Integration**: Google Gemini API for buyer guidance
- **Internationalization**: Built-in English/Spanish support

### Project Structure
```
src/
├── app/                     # Next.js App Router pages
│   ├── api/leads/          # API route for lead management
│   ├── wizard/             # Homebuyer wizard page
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Homepage
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── wizard/            # Multi-step homebuyer wizard
│   ├── layout/            # Header, footer, container components
│   └── providers.tsx      # Context providers wrapper
├── contexts/              # React contexts (language, theme)
├── lib/
│   ├── services/          # Business logic services
│   ├── i18n.ts           # Internationalization utilities
│   ├── env.ts            # Environment variable validation
│   └── utils.ts          # Utility functions
├── ai/                   # AI integration (Gemini client)
├── integrations/         # External service integrations
└── validators/           # Zod schemas for form validation
```

### Key Architectural Patterns

1. **Multilingual Support**: Complete i18n system with translations in `src/lib/i18n.ts`
2. **TypeScript Path Aliases**: Configured in `tsconfig.json` using `@/*` pattern
3. **Context-Based State**: Language and theme managed via React contexts
4. **Service Layer**: Business logic separated into `src/lib/services/`
5. **Form Validation**: Zod schemas in `src/validators/` with React Hook Form
6. **Component System**: shadcn/ui components with Tailwind CSS styling

### Adding shadcn/ui Components
```bash
npx shadcn-ui@latest add [component-name]
```

### Environment Variables
Required variables (see `.env.local.example`):
- `GOOGLE_API_KEY` - For AI-powered buyer guidance
- `CENSUS_API_KEY` - For demographic data
- `MORTGAGE_RATES_API_KEY` - For current rates
- `ZAPIER_WEBHOOK_URL` - For CRM lead routing

### Code Quality Setup
- **Husky**: Pre-commit hooks for linting and formatting
- **lint-staged**: Runs linters on staged files only
- **ESLint**: Next.js + TypeScript configuration
- **Prettier**: Consistent code formatting

### Key Features
- **Interactive Homebuyer Wizard**: Multi-step form in `src/components/wizard/`
- **AI-Powered Guidance**: Google Gemini integration for personalized advice
- **Lead Generation**: Automated CRM integration via Zapier webhooks
- **Mobile-First Design**: Responsive components with Tailwind CSS
- **Performance Optimized**: Next.js 15 features, image optimization, security headers