# Deployment Guide

## GitHub Setup

1. **Create repository** at https://github.com/t3dy/SnakeAB
   - Public repository
   - Initialize without README (we have one)

2. **Add remote and push**:
   ```bash
   cd C:\Dev\SNAKEAB
   git remote add origin https://github.com/t3dy/SnakeAB.git
   git branch -M main
   git push -u origin main
   ```

## Vercel Deployment

### Option 1: CLI (Recommended)
```bash
npm install -g vercel
vercel login
vercel
```

### Option 2: GitHub Integration
1. Go to https://vercel.com/new
2. Import from GitHub
3. Select `t3dy/SnakeAB`
4. Deploy

### Configuration
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Vercel will auto-detect from `vercel.json`

## Environment Variables
None required for this project (no API keys needed).

## Deployment Status
After deployment, your game will be live at:
- https://snakeab.vercel.app (or custom domain)

## Updating After Deployment
```bash
git push origin main
# Vercel auto-deploys on push
```

## Custom Domain (Optional)
1. In Vercel dashboard, go to project settings
2. Add your domain in "Domains"
3. Update DNS records as instructed

## Monitoring
- Check deployments at https://vercel.com/dashboard
- Logs available in Vercel console
- Performance metrics tracked automatically
