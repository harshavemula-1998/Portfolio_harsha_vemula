# GitHub Actions Deployment Setup

## Overview
This repository is configured to automatically deploy to S3 and invalidate CloudFront on every push to the `main` branch.

## GitHub Secrets Configuration

You need to add the following secrets to your GitHub repository:

### Steps to Add Secrets:

1. Go to your GitHub repository: https://github.com/harshavemula-1998/Portfolio_harsha_vemula
2. Click on **Settings** tab
3. In the left sidebar, click on **Secrets and variables** > **Actions**
4. Click on **New repository secret**

### Required Secrets:

#### 1. AWS_ACCESS_KEY_ID
- **Name**: `AWS_ACCESS_KEY_ID`
- **Value**: Your AWS Access Key ID from the `access_key_password` file

#### 2. AWS_SECRET_ACCESS_KEY
- **Name**: `AWS_SECRET_ACCESS_KEY`
- **Value**: Your AWS Secret Access Key from the `access_key_password` file

**Note**: The credentials are stored in `/Users/saiharshavemula/Desktop/access_key_password` on your local machine.

## Workflow Details

### What the workflow does:
1. ✅ Triggers on every push to `main` branch
2. ✅ Syncs all files to S3 bucket: `s3://saiharshavemula.com`
3. ✅ Sets appropriate cache headers:
   - Static assets (images, fonts): 1 year cache
   - HTML/CSS/JS files: 1 hour cache
4. ✅ Invalidates CloudFront distribution: `E1NM1JU5WPCOK8`
5. ✅ Waits for invalidation to complete
6. ✅ Provides deployment summary

### CloudFront Distribution
- **Distribution ID**: E1NM1JU5WPCOK8
- **Domain**: saiharshavemula.com
- **CloudFront URL**: https://d2puk096y19qi6.cloudfront.net

### S3 Bucket
- **Bucket Name**: saiharshavemula.com
- **Region**: us-east-1

## Testing the Deployment

After adding the secrets:
1. Make any change to your portfolio
2. Commit and push to `main` branch
3. Go to **Actions** tab in GitHub to monitor the deployment
4. Once complete, visit https://saiharshavemula.com to see your changes

## Workflow File Location
`.github/workflows/deploy.yml`

## Important Notes
- The workflow excludes `.git`, `.github`, and `.md` files from S3 sync
- CloudFront invalidation may take 5-10 minutes to propagate globally
- The workflow uses `--delete` flag to remove files from S3 that are no longer in the repository
