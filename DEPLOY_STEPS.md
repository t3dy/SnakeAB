# Deployment Steps to GitHub & Vercel

Your SnakeAB game is ready to deploy! Follow these steps to get it live.

## Step 1: Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `SnakeAB`
3. Description: "A personality-driven autobattler game with emergent AI"
4. Select: **Public**
5. Click "Create repository"

You'll see instructions like:
```
…or push an existing repository from the command line
```

## Step 2: Push to GitHub

Run these commands in PowerShell from `C:\Dev\SNAKEAB`:

```powershell
cd C:\Dev\SNAKEAB
git branch -M main
git remote add origin https://github.com/t3dy/SnakeAB.git
git push -u origin main
```

This will:
- Rename the branch to `main`
- Add GitHub as the remote
- Push all code to GitHub

**You may be prompted for GitHub credentials** — use:
- Username: `t3dy`
- Password: Your GitHub personal access token (or regular password)

To create a personal access token:
1. Go to **GitHub Settings** → **Developer settings** → **Personal access tokens**
2. Create a token with `repo` scope
3. Use it instead of your password

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Easiest)

```powershell
npm install -g vercel
vercel login
vercel
```

Follow the prompts:
- Link to existing project: **No**
- Project name: `snakeab`
- Framework: **Vite**
- Root directory: `./`
- Build command: `npm run build` (default)
- Output directory: `dist` (default)

Vercel will deploy and give you a URL.

### Option B: Using Vercel Dashboard

1. Go to **https://vercel.com/new**
2. Click "Import Git Repository"
3. Select `t3dy/SnakeAB`
4. Click "Import"
5. Framework: **Vite**
6. Build command: `npm run build`
7. Output directory: `dist`
8. Click "Deploy"

## Step 4: Verify Deployment

1. Go to your **Vercel project dashboard**
2. Wait for build to complete (should be < 2 min)
3. Click the deployment URL
4. Game should load and be playable

## Default Vercel URL

Your game will be at:
- `https://snake-ab.vercel.app`

(or a similar Vercel-generated URL)

## Optional: Custom Domain

1. In Vercel dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Auto-Deployment

After setup:
- **Every push to `main`** triggers a Vercel deploy
- No manual steps needed
- Vercel builds and deploys automatically

Just commit and push:
```powershell
git add -A
git commit -m "Your message"
git push
```

## Monitoring

- **Vercel Dashboard**: https://vercel.com/dashboard
  - View deployments
  - Check logs
  - See performance metrics

- **GitHub**: https://github.com/t3dy/SnakeAB
  - View code
  - Create issues
  - Accept pull requests

## Done!

Your game is now:
- ✅ On GitHub at `https://github.com/t3dy/SnakeAB`
- ✅ Deployed to `https://snake-ab.vercel.app`
- ✅ Auto-deploying on every push

Share the Vercel URL with anyone who wants to play!

---

## Troubleshooting

### "Permission denied (publickey)"
- Check you have SSH key set up or use HTTPS with token
- Or use Vercel CLI instead (no SSH needed)

### "Build failed"
- Check Vercel logs
- Ensure `npm run build` works locally: `npm run build`
- Check `vercel.json` configuration

### "Game not loading"
- Check browser console (F12)
- Check Vercel deployment logs
- Clear browser cache

### Need help?
- Vercel docs: https://vercel.com/docs
- GitHub docs: https://docs.github.com
- SnakeAB DEPLOYMENT.md in project root

