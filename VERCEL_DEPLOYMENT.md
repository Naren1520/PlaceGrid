# Vercel Deployment Guide

## Environment Variables Setup

To deploy this application on Vercel, you need to set the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **MONGODB_URI**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appname>
   ```
   Get this from your MongoDB Atlas dashboard

2. **JWT_SECRET**
   ```
   <your-jwt-secret-key>
   ```
   Generate using: `openssl rand -base64 32`

3. **GROQ_API_KEY** (if using GROQ features)
   ```
   <your-groq-api-key>
   ```
   Get this from GROQ dashboard

## Steps to Deploy

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add each variable listed above with your actual values
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## Admin Login Credentials

After deployment, you can login as coordinator using:
- **Email:** admin
- **Password:** admin123

## Troubleshooting

### 500 Internal Server Error on Login

If you get a 500 error when trying to login:

1. **Check Environment Variables**
   - Verify all environment variables are set in Vercel dashboard
   - Make sure MONGODB_URI is correct and accessible

2. **Check MongoDB Network Access**
   - In MongoDB Atlas, go to Network Access
   - Add `0.0.0.0/0` to allow access from anywhere (or add Vercel's IP ranges)

3. **Check Vercel Logs**
   - Go to your Vercel project
   - Click on "Deployments"
   - Click on the latest deployment
   - Check "Functions" tab for error logs

4. **Test Admin Login First**
   - Admin login (admin/admin123) doesn't require database
   - If this works, the issue is with MongoDB connection
   - If this fails, check JWT_SECRET environment variable

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas cluster allows connections from Vercel:

1. Go to MongoDB Atlas Dashboard
2. Click "Network Access" in the left sidebar
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

## Testing After Deployment

1. Visit your deployed URL
2. Try logging in with admin credentials
3. Create a company account from coordinator dashboard
4. Test company login
5. Register a student account
6. Test student login

## Common Issues

### Issue: "Database connection failed"
**Solution:** Check MONGODB_URI environment variable and MongoDB Network Access settings

### Issue: "Invalid token"
**Solution:** Check JWT_SECRET environment variable is set correctly

### Issue: Admin login works but other logins fail
**Solution:** MongoDB connection issue - verify MONGODB_URI and network access

## Support

If you continue to have issues, check:
- Vercel deployment logs
- MongoDB Atlas logs
- Browser console for client-side errors
