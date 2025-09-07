# HealthMate AI Guardian - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel + Railway (Recommended for Hackathon)

#### Frontend (Vercel)
1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/healthmate-ai-guardian.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `build`
   - Add environment variable: `REACT_APP_API_URL=https://your-backend.railway.app`

#### Backend (Railway)
1. **Prepare for Railway**:
   ```bash
   cd backend
   # Create Procfile
   echo "web: python run.py" > Procfile
   ```

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Select backend folder
   - Add environment variables:
     ```
     SUPABASE_URL=your-supabase-url
     SUPABASE_KEY=your-supabase-key
     SMTP_USERNAME=your-email
     SMTP_PASSWORD=your-app-password
     ```

### Option 2: Netlify + Heroku

#### Frontend (Netlify)
1. **Build locally**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `build` folder
   - Add environment variable: `REACT_APP_API_URL=https://your-app.herokuapp.com`

#### Backend (Heroku)
1. **Create Heroku app**:
   ```bash
   # Install Heroku CLI
   heroku create healthmate-backend
   ```

2. **Deploy**:
   ```bash
   cd backend
   git subtree push --prefix=backend heroku main
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set SUPABASE_URL=your-supabase-url
   heroku config:set SUPABASE_KEY=your-supabase-key
   ```

### Option 3: Full Vercel Stack

#### Frontend + Backend (Vercel)
1. **Create vercel.json**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       },
       {
         "src": "backend/main_supabase.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/backend/main_supabase.py"
       },
       {
         "src": "/(.*)",
         "dest": "/frontend/build/$1"
       }
     ]
   }
   ```

## 🗄️ Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region closest to your users
4. Wait for project to be ready

### 2. Get Credentials
1. Go to **Settings** → **API**
2. Copy **Project URL** and **anon public** key
3. Example:
   ```
   Project URL: https://abcdefgh.supabase.co
   anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. Setup Database
1. Go to **SQL Editor**
2. Run the schema from `backend/supabase_schema.sql`
3. Verify tables are created

## 📧 Email Configuration

### Gmail Setup
1. **Enable 2-Factor Authentication**
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use App Password** in environment variables

### Other Email Providers
- **Outlook**: Use app passwords
- **SendGrid**: Use API keys
- **Mailgun**: Use API keys

## 🔧 Environment Variables

### Backend (.env)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## 🧪 Testing Deployment

### 1. Test Backend
```bash
curl https://your-backend-url.com/
# Should return: {"message": "HealthMate AI Guardian API is running!"}
```

### 2. Test Frontend
- Open your frontend URL
- Try creating a user
- Test all features

### 3. Test Database
- Check Supabase dashboard
- Verify data is being stored
- Test API endpoints

## 🚨 Troubleshooting

### Common Issues

#### Backend Not Starting
- Check environment variables
- Verify Python dependencies
- Check logs for errors

#### Frontend Build Fails
- Check Node.js version (16+)
- Clear node_modules and reinstall
- Check for TypeScript errors

#### Database Connection Issues
- Verify Supabase credentials
- Check RLS policies
- Test with Supabase client

#### CORS Errors
- Update CORS origins in backend
- Check API URL in frontend
- Verify HTTPS in production

### Debug Commands
```bash
# Backend logs
heroku logs --tail
railway logs

# Frontend build
npm run build
npm run test

# Database test
psql your-database-url
```

## 📊 Performance Optimization

### Frontend
- **Code Splitting**: Already implemented
- **Image Optimization**: Use WebP format
- **Caching**: Set proper cache headers
- **CDN**: Use Vercel/Netlify CDN

### Backend
- **Database Indexing**: Add indexes for queries
- **Connection Pooling**: Use connection pooling
- **Caching**: Implement Redis caching
- **Compression**: Enable gzip compression

## 🔒 Security Checklist

### Production Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] Rate limiting implemented

### Database Security
- [ ] RLS policies enabled
- [ ] API keys secured
- [ ] Database backups enabled
- [ ] Access logs monitored

## 📱 Mobile Deployment

### PWA Features
- Add service worker
- Create manifest.json
- Enable offline functionality
- Add app icons

### App Store Deployment
- Use Capacitor for mobile apps
- Create native builds
- Submit to app stores

## 🎯 Hackathon Demo Tips

### Pre-Demo Checklist
- [ ] All features working
- [ ] Database populated with sample data
- [ ] Email notifications working
- [ ] Mobile responsive
- [ ] Fast loading times
- [ ] Error handling in place

### Demo Script
1. **Show UI** (30s): Beautiful, modern design
2. **User Flow** (2m): Registration → Add meds → Log mood
3. **AI Features** (1m): Sentiment analysis working
4. **Family Features** (1m): Caregiver notifications
5. **Mobile Demo** (30s): Responsive design
6. **Technical** (1m): Architecture overview

### Backup Plans
- **Local Demo**: Run locally if cloud fails
- **Screenshots**: Have demo screenshots ready
- **Video**: Record demo video as backup
- **Slides**: Prepare presentation slides

## 🚀 Go Live!

Your HealthMate AI Guardian is now ready for deployment! Choose the option that works best for your hackathon timeline and requirements.

**Recommended for Hackathons**: Vercel + Railway + Supabase
- Fastest setup
- Reliable hosting
- Easy to scale
- Great for demos

Good luck with your hackathon! 🏆
