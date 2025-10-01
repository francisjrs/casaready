# Vercel Deployment Guide for CasaReady

## 🚀 Environment Variables for Vercel

### Required Environment Variables

Set these in your Vercel project dashboard (`Project Settings > Environment Variables`):

#### **Production Environment**
```bash
# API Keys (PRIVATE)
GEMINI_API_KEY=AIzaSyAFoaX6mIwZtA0I82dXSVIQkXwnsKGnyhw

# Webhooks (PRIVATE)
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/22573164/uhkxqwx/

# Analytics (PUBLIC)
NEXT_PUBLIC_GA_ID=G-8L75VSCCDF

# Site Configuration (PUBLIC)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Realtor Contact Information (PUBLIC)
NEXT_PUBLIC_REALTOR_NAME="Sully Ruiz"
NEXT_PUBLIC_REALTOR_ADDRESS="9606 N Mopac Expy #950, Austin, TX 78759"
NEXT_PUBLIC_REALTOR_PHONE="(512) 412-2352"
NEXT_PUBLIC_REALTOR_WHATSAPP="(512) 412-2352"
NEXT_PUBLIC_REALTOR_EMAIL="realtor@sullyruiz.com"
NEXT_PUBLIC_REALTOR_FACEBOOK="https://www.facebook.com/sullyruizrealtor"
NEXT_PUBLIC_REALTOR_INSTAGRAM="https://www.instagram.com/sullyruizrealtor/"

# Environment
NODE_ENV=production
```

#### **Preview Environment**
Use the same values but with:
```bash
NEXT_PUBLIC_SITE_URL=https://your-preview-domain.vercel.app
NODE_ENV=development
```

## 📋 Deployment Checklist

### 1. **Repository Setup**
- [ ] Code pushed to GitHub/GitLab
- [ ] `.env.local` NOT committed (check `.gitignore`)
- [ ] `.env.example` committed with documentation

### 2. **Vercel Project Setup**
- [ ] Project connected to Vercel
- [ ] Environment variables configured
- [ ] Custom domain configured (optional)

### 3. **Environment Variable Security**
- [ ] **PRIVATE** variables (no `NEXT_PUBLIC_` prefix):
  - `GEMINI_API_KEY` - Server-side only
  - `ZAPIER_WEBHOOK_URL` - Server-side only
- [ ] **PUBLIC** variables (with `NEXT_PUBLIC_` prefix):
  - All realtor contact info
  - Google Analytics ID
  - Site URL

### 4. **Domain Configuration**
```bash
# Update NEXT_PUBLIC_SITE_URL for your domain
NEXT_PUBLIC_SITE_URL=https://casaready.sullyruiz.com
```

### 5. **Google Analytics Setup**
- [ ] GA4 property created
- [ ] Tracking ID configured in `NEXT_PUBLIC_GA_ID`
- [ ] Conversion goals set up

### 6. **Zapier Webhook Testing**
- [ ] Test webhook with curl:
```bash
curl -X POST 'https://hooks.zapier.com/hooks/catch/22573164/uhkxqwx/' \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name": "Test",
    "last_name": "Deploy",
    "email": "test@casaready.com",
    "phone": "+15125550101",
    "notes": "Production deployment test",
    "tags": "Production,Test",
    "description": "Source: Production Test"
  }'
```

## 🔐 Security Best Practices

### Environment Variable Types

| Variable Type | Example | Visibility | Usage |
|---------------|---------|------------|-------|
| **Private** | `GEMINI_API_KEY` | Server-side only | API keys, secrets |
| **Public** | `NEXT_PUBLIC_GA_ID` | Client-side accessible | Public configuration |

### Security Rules
1. **Never** put API keys in `NEXT_PUBLIC_` variables
2. **Always** use HTTPS in production
3. **Validate** all environment variables on startup
4. **Rotate** API keys regularly

## 🚀 Deployment Commands

### Deploy to Vercel
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy preview
vercel
```

### Local Development
```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Start development server
npm run dev
```

## 📊 Monitoring & Analytics

### Google Analytics
- **Goal**: Lead form submissions
- **Events**: Button clicks, form starts, page views
- **Conversions**: Form completions

### Lead Tracking
- All form submissions go to Zapier → KW Command
- Rate limiting: 5 submissions per 15 minutes per IP
- Automatic retry logic with exponential backoff

## 🎯 Lead Capture Flow

```
User Form → API Validation → Zapier Webhook → KW Command
     ↓              ↓              ↓              ↓
  Hero Form    Rate Limiting   Lead Format    CRM Entry
  Full Wizard   Field Validation  Notes Field   Auto-Response
```

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Check variable names (exact match required)
   - Ensure `NEXT_PUBLIC_` prefix for client-side variables
   - Redeploy after environment variable changes

2. **Zapier Webhook Failures**
   - Check webhook URL format
   - Verify rate limiting (5 per 15 min)
   - Test with curl command above

3. **Google Analytics Not Tracking**
   - Verify `NEXT_PUBLIC_GA_ID` format (`G-XXXXXXXXXX`)
   - Check browser developer tools for GA requests
   - Ensure production environment

### Debug Commands
```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Test API endpoint
curl https://your-domain.vercel.app/api/leads
```

## 📞 Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Contact: realtor@sullyruiz.com