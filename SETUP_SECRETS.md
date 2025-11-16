# Quick Setup: Add GitHub Secrets

## Step-by-Step Instructions

### 1. Open GitHub Repository Settings
Go to: https://github.com/harshavemula-1998/Portfolio_harsha_vemula/settings/secrets/actions

### 2. Add First Secret - AWS_ACCESS_KEY_ID
1. Click **"New repository secret"**
2. **Name**: `AWS_ACCESS_KEY_ID`
3. **Secret**: Copy the first line from `/Users/saiharshavemula/Desktop/access_key_password`
4. Click **"Add secret"**

### 3. Add Second Secret - AWS_SECRET_ACCESS_KEY
1. Click **"New repository secret"** again
2. **Name**: `AWS_SECRET_ACCESS_KEY`
3. **Secret**: Copy the second line from `/Users/saiharshavemula/Desktop/access_key_password`
4. Click **"Add secret"**

## Test the Workflow

After adding both secrets:

1. Go to: https://github.com/harshavemula-1998/Portfolio_harsha_vemula/actions
2. You should see the workflow running automatically from the push we just made
3. If not, make a small change (like adding a space) and push again
4. The workflow will:
   - ✅ Sync files to S3
   - ✅ Invalidate CloudFront
   - ✅ Your changes will be live at https://saiharshavemula.com within 5-10 minutes

## Workflow File
Location: `.github/workflows/deploy.yml`

## What Happens Now
Every time you push to the `main` branch:
- Portfolio automatically syncs to S3
- CloudFront cache gets invalidated
- Changes are live immediately

That's it! No manual S3 uploads or CloudFront invalidations needed anymore.
