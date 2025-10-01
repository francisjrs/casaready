# CasaReady

> **AI-powered real estate lead generation and buyer assistance platform**

CasaReady is an intelligent real estate platform that helps potential homebuyers navigate the home buying process while generating qualified leads for real estate professionals. Features multilingual support (English/Spanish), AI-powered guidance, and seamless CRM integration. Built with Next.js 15, TypeScript, and modern web technologies.

## ✨ Features

- 🏡 **Interactive Buyer Wizard** - Multi-step form to capture buyer preferences and financial situation
- 🤖 **AI-Powered Guidance** - Google Gemini provides personalized homebuying advice and program recommendations
- 📊 **Market Data Integration** - Real-time mortgage rates, census data, and housing market insights
- 🎯 **Lead Generation** - Seamless capture and routing of qualified leads to real estate professionals
- 🌍 **Bilingual Support** - Full English and Spanish localization for diverse markets
- 📱 **Mobile-First Design** - Optimized experience across all devices
- 🔗 **CRM Integration** - Direct integration with KW Command and other real estate platforms
- ⚡ **Performance Optimized** - Built with Next.js 15 and React 19

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Forms**: React Hook Form, Zod validation
- **AI**: Google Gemini API for buyer guidance
- **Integrations**: Zapier webhooks, KW Command CRM
- **APIs**: Census data, mortgage rates, USDA/FEMA programs
- **Development**: ESLint, Prettier, Husky, lint-staged
- **CI/CD**: GitHub Actions, Vercel
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- Git

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/casaready.git
cd casaready
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys and configuration values:

```env
# Required for AI features
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Real estate data APIs
CENSUS_API_KEY=your_census_api_key
MORTGAGE_RATES_API_KEY=your_mortgage_rates_api_key
USDA_API_KEY=your_usda_api_key
FEMA_API_KEY=your_fema_api_key

# CRM Integration
ZAPIER_WEBHOOK_URL=your_zapier_webhook_url
KW_COMMAND_API_KEY=your_kw_command_api_key

# Localization
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

### 4. Prepare Husky for Git hooks

```bash
npm run prepare
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📝 Available Scripts

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run type-check` - Run TypeScript type checking

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Setup

- `npm run prepare` - Set up Husky Git hooks

## 📁 Project Structure

```
casaready/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── .husky/
│   └── pre-commit              # Git pre-commit hook
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   └── lib/
│       └── utils.ts            # Utility functions
├── .env.local.example          # Environment variables template
├── .eslintrc.json             # ESLint configuration
├── .gitignore                 # Git ignore rules
├── .lintstagedrc.js           # lint-staged configuration
├── .prettierrc                # Prettier configuration
├── .prettierignore            # Prettier ignore rules
├── components.json            # shadcn/ui configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Project dependencies and scripts
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── vercel.json                # Vercel deployment configuration
```

## 🔧 Configuration

### Adding shadcn/ui Components

To add new shadcn/ui components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

### Environment Variables

Key environment variables you may need to configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini API key for AI-powered buyer guidance | Yes |
| `CENSUS_API_KEY` | US Census Bureau API for demographic data | Yes |
| `MORTGAGE_RATES_API_KEY` | Current mortgage rates API | Yes |
| `ZAPIER_WEBHOOK_URL` | Webhook URL for lead routing to CRM | Yes |
| `KW_COMMAND_API_KEY` | Keller Williams Command CRM integration | Optional |
| `USDA_API_KEY` | USDA rural development program data | Optional |
| `FEMA_API_KEY` | FEMA flood zone and disaster data | Optional |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default language (en/es) | Optional |

See `.env.local.example` for a complete list of available environment variables.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push to main

### Manual Deployment

```bash
npm run build
npm run start
```

## 🧪 Development Workflow

### Git Hooks

Pre-commit hooks automatically run:
- ESLint with auto-fix
- Prettier formatting
- TypeScript type checking

### CI/CD Pipeline

GitHub Actions automatically:
- Runs linting and type checking
- Builds the application
- Runs security audits
- Provides quality gates

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and ensure code quality: `npm run lint && npm run type-check`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Keep components small and focused
- Add JSDoc comments for complex functions

## 📊 Performance

CasaReady is optimized for performance:

- **Next.js 15** with App Router and React Server Components
- **Turbopack** for faster development builds
- **Image optimization** with Next.js Image component
- **Bundle splitting** for optimal loading
- **CSS-in-JS** with Tailwind CSS for minimal runtime

## 🔒 Security

Security best practices implemented:

- Content Security Policy headers
- Environment variable validation
- Dependency security audits
- Regular security updates
- Input sanitization and validation

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Project Wiki](https://github.com/your-username/casaready/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/casaready/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/casaready/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Vercel](https://vercel.com/) - Platform for frontend frameworks and static sites

---

**Built with ❤️ for smarter real estate lead generation and buyer assistance**