# Terraform Deployment Guide

Complete guide for deploying and managing your portfolio infrastructure using Terraform with AWS best practices.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Infrastructure Components](#infrastructure-components)
5. [Security Features](#security-features)
6. [Cost Management](#cost-management)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Maintenance](#maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

```bash
# Install Terraform
brew install terraform  # macOS
# or download from https://www.terraform.io/downloads

# Verify installation
terraform version  # Should be >= 1.5.0

# Install AWS CLI
brew install awscli  # macOS
# or download from https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
```

### AWS Requirements

Before starting, ensure you have:

1. **ACM Certificate** (SSL/TLS) in `us-east-1` region
   ```bash
   # Check existing certificates
   aws acm list-certificates --region us-east-1

   # Request new certificate if needed
   aws acm request-certificate \
     --domain-name saiharshavemula.com \
     --subject-alternative-names www.saiharshavemula.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Route53 Hosted Zone** for your domain
   ```bash
   # Check existing hosted zones
   aws route53 list-hosted-zones

   # Create if needed
   aws route53 create-hosted-zone \
     --name saiharshavemula.com \
     --caller-reference $(date +%s)
   ```

3. **AWS Credentials** with appropriate permissions
   - S3 full access
   - CloudFront full access
   - Route53 full access
   - ACM read access
   - CloudWatch full access
   - SNS full access
   - DynamoDB full access

## Quick Start

### 1. Initial Setup (First Time Only)

```bash
# Navigate to terraform directory
cd terraform

# Create variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
vim terraform.tfvars
```

### 2. Set Up State Backend

```bash
# Initialize Terraform
terraform init

# Create S3 and DynamoDB for state management
make backend-setup

# Or manually:
terraform apply \
  -target=aws_s3_bucket.terraform_state \
  -target=aws_dynamodb_table.terraform_state_lock
```

### 3. Enable Remote State

Edit `versions.tf` and uncomment the backend block:

```hcl
backend "s3" {
  bucket         = "saiharshavemula-terraform-state"
  key            = "portfolio/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "terraform-state-lock"
}
```

Migrate state:

```bash
terraform init -migrate-state
```

### 4. Deploy Infrastructure

```bash
# Using Makefile (recommended)
make plan    # Review changes
make apply   # Deploy infrastructure

# Or directly with Terraform
terraform plan
terraform apply
```

### 5. Confirm SNS Subscription

Check your email and confirm the SNS subscription for CloudWatch alarms.

### 6. Deploy Website Content

```bash
# Using Makefile
make deploy-content

# Or manually
aws s3 sync . s3://saiharshavemula.com \
  --exclude ".git/*" \
  --exclude ".github/*" \
  --exclude "terraform/*" \
  --delete

aws cloudfront create-invalidation \
  --distribution-id E1NM1JU5WPCOK8 \
  --paths "/*"
```

## Detailed Setup

### Configuration Variables

Edit `terraform.tfvars`:

```hcl
# Domain configuration
domain_name = "saiharshavemula.com"

# Environment
environment  = "prod"  # or "dev", "staging"
project_name = "portfolio"

# Feature flags
enable_cloudfront_logging = true   # Enable access logs
enable_s3_versioning     = true   # Enable file versioning

# CloudFront configuration
cloudfront_price_class = "PriceClass_100"  # North America & Europe
# Options: PriceClass_100, PriceClass_200, PriceClass_All

# Monitoring
alarm_email = "vemulasaiharsha@gmail.com"  # For CloudWatch alerts

# Tags (for cost tracking)
tags = {
  Project     = "Portfolio"
  ManagedBy   = "Terraform"
  Owner       = "Sai Harsha Vemula"
  Environment = "Production"
  CostCenter  = "Personal"
}
```

### Using Makefile Commands

The `Makefile` provides convenient shortcuts:

```bash
# Help
make help

# Infrastructure operations
make init           # Initialize Terraform
make plan           # Show execution plan
make apply          # Apply changes
make destroy        # Destroy infrastructure

# Code quality
make fmt            # Format Terraform files
make validate       # Validate configuration
make lint           # Run tflint
make security-scan  # Run tfsec security scan

# Utilities
make output         # Show outputs
make state-list     # List all resources
make show-urls      # Show important URLs
make deploy-content # Deploy website content

# Full deployment
make full-deployment  # Init + Plan + Apply + Deploy content
```

## Infrastructure Components

### 1. S3 Buckets

**Primary Bucket** (`saiharshavemula.com`):
- Server-side encryption (AES256)
- Versioning enabled
- Public access blocked
- Lifecycle policies for cost optimization

**Logs Bucket** (`saiharshavemula.com-logs`):
- Stores CloudFront access logs
- Automatic retention (90 days)
- Encrypted at rest

### 2. CloudFront Distribution

**Features**:
- Global CDN with edge locations
- Automatic HTTPS redirect
- Brotli and Gzip compression
- Custom cache policies per file type
- Security headers on all responses
- Origin Access Control (OAC) for S3

**Cache Policies**:
- Static assets (images, fonts): 1 year
- HTML/dynamic content: 1 hour
- PDFs: 24 hours

### 3. Route53 DNS

**Records Created**:
- `A` record: `saiharshavemula.com` → CloudFront
- `AAAA` record: `saiharshavemula.com` → CloudFront (IPv6)
- `A` record: `www.saiharshavemula.com` → CloudFront
- `AAAA` record: `www.saiharshavemula.com` → CloudFront (IPv6)

### 4. CloudWatch Monitoring

**Alarms**:
- 4xx error rate > 5%
- 5xx error rate > 1%
- Origin latency > 1000ms
- Request count > 100,000 (5 min)

**Dashboard**:
Access at: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:

## Security Features

### HTTP Security Headers

All responses include:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Infrastructure Security

- **S3**: Private with OAC, encryption at rest
- **CloudFront**: TLS 1.2+ only, WAF-ready
- **State**: Encrypted in S3, locked with DynamoDB
- **Secrets**: Never stored in code
- **IAM**: Principle of least privilege

### Security Scanning

```bash
# Run security scan with tfsec
make security-scan

# Or manually
tfsec terraform/

# Run with Checkov (in CI/CD)
checkov -d terraform/ --framework terraform
```

## Cost Management

### Current Monthly Estimates

| Service | Est. Cost | Notes |
|---------|-----------|-------|
| S3 Storage | $0.50 - $2.00 | Based on ~5GB storage |
| S3 Requests | < $0.10 | Minimal direct requests |
| CloudFront | $1.00 - $5.00 | Based on traffic volume |
| Route53 | $0.50 | Hosted zone |
| DynamoDB | < $0.25 | State locking only |
| CloudWatch | Free | Within free tier |
| **Total** | **$2 - $8/month** | May vary with traffic |

### Cost Optimization Tips

1. **CloudFront Price Class**: Using `PriceClass_100` (vs `PriceClass_All`)
2. **S3 Lifecycle**: Old versions auto-deleted after 90 days
3. **Intelligent Tiering**: Auto-moves to cheaper storage
4. **Cache Optimization**: High cache hit rate reduces origin requests
5. **DynamoDB**: Pay-per-request (vs provisioned)

### Monitor Costs

```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --filter file://cost-filter.json

# Set up budget alerts
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json
```

## Monitoring & Alerts

### CloudWatch Dashboard

Access: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:

**Metrics**:
- Total requests
- Error rates (4xx, 5xx)
- Data transfer (bytes)
- Origin latency
- Cache hit rate

### Email Alerts

You'll receive emails for:
- High error rates (4xx > 5%, 5xx > 1%)
- High latency (> 1000ms)
- Unusual traffic spikes

### Custom Metrics

```bash
# Check distribution statistics
aws cloudfront get-distribution-config \
  --id $(terraform output -raw cloudfront_distribution_id)

# View recent logs (if enabled)
aws s3 ls s3://saiharshavemula.com-logs/cloudfront/ --recursive | tail -n 20
```

## Maintenance

### Regular Tasks

**Weekly**:
- Review CloudWatch dashboard
- Check for unusual traffic patterns

**Monthly**:
- Review cost reports
- Check alarm history
- Verify certificate expiry (ACM auto-renews)

**Quarterly**:
- Update Terraform version
- Update AWS provider version
- Review and update security policies
- Audit IAM permissions

### Updates

```bash
# Update Terraform
brew upgrade terraform

# Update providers
cd terraform
terraform init -upgrade

# Review changes
terraform plan

# Apply if needed
terraform apply
```

### Backup & Recovery

**State Backup**:
- Automatic versioning in S3
- DynamoDB point-in-time recovery enabled

**Restore from backup**:
```bash
# List state versions
aws s3api list-object-versions \
  --bucket saiharshavemula-terraform-state \
  --prefix portfolio/terraform.tfstate

# Download specific version
aws s3api get-object \
  --bucket saiharshavemula-terraform-state \
  --key portfolio/terraform.tfstate \
  --version-id <VERSION_ID> \
  terraform.tfstate.backup
```

## Troubleshooting

### Common Issues

#### 1. "Error: No valid credential sources"

```bash
# Configure AWS credentials
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-east-1"
```

#### 2. "Error: acquiring state lock"

```bash
# Check lock status
aws dynamodb get-item \
  --table-name terraform-state-lock \
  --key '{"LockID": {"S": "saiharshavemula-terraform-state/portfolio/terraform.tfstate"}}'

# Force unlock (use with caution!)
terraform force-unlock <LOCK_ID>
```

#### 3. "ACM certificate not found"

```bash
# Verify certificate exists
aws acm list-certificates --region us-east-1

# Check certificate status
aws acm describe-certificate \
  --certificate-arn <ARN> \
  --region us-east-1
```

#### 4. CloudFront deployment taking long

CloudFront distributions take 15-30 minutes to deploy. This is normal.

```bash
# Check deployment status
aws cloudfront get-distribution \
  --id $(terraform output -raw cloudfront_distribution_id) \
  --query 'Distribution.Status'
```

#### 5. "Error 403" on website

```bash
# Check S3 bucket policy
terraform state show module.s3.aws_s3_bucket_policy.website

# Verify CloudFront can access S3
aws s3api get-bucket-policy --bucket saiharshavemula.com
```

### Getting Help

1. Check Terraform logs: `TF_LOG=DEBUG terraform apply`
2. Review AWS CloudWatch logs
3. Check GitHub Issues
4. Email: vemulasaiharsha@gmail.com

## Advanced Topics

### Multi-Environment Setup

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch workspace
terraform workspace select dev

# Deploy to specific environment
terraform apply -var-file=environments/dev/terraform.tfvars
```

### Disaster Recovery

```bash
# Export current state
terraform show -json > state-backup.json

# Import existing resources
terraform import module.s3.aws_s3_bucket.website saiharshavemula.com
```

### Custom Modules

Add custom modules in `terraform/modules/`:

```hcl
module "custom_feature" {
  source = "./modules/custom_feature"

  domain_name = var.domain_name
  tags        = var.tags
}
```

## Next Steps

1. Review security scan results
2. Set up automated deployments (GitHub Actions)
3. Enable AWS WAF for DDoS protection
4. Add Route53 health checks
5. Implement blue-green deployments
6. Set up cost allocation tags

---

**Documentation Version**: 1.0
**Last Updated**: November 2025
**Maintained by**: Sai Harsha Vemula
