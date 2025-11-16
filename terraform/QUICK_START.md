# Terraform Quick Start Guide

## First Time Setup (10 minutes)

### 1. Install Prerequisites

```bash
# Install Terraform
brew install terraform

# Install AWS CLI (if not already installed)
brew install awscli

# Configure AWS credentials
aws configure
```

### 2. Prepare Configuration

```bash
cd terraform

# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
vim terraform.tfvars
```

### 3. Initialize & Deploy Backend

```bash
# Option A: Using Makefile (recommended)
make backend-setup

# Option B: Manual commands
terraform init
terraform apply \
  -target=aws_s3_bucket.terraform_state \
  -target=aws_dynamodb_table.terraform_state_lock
```

### 4. Enable Remote State

Edit `versions.tf` - uncomment lines 12-18:

```hcl
backend "s3" {
  bucket         = "saiharshavemula-terraform-state"
  key            = "portfolio/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "terraform-state-lock"
}
```

Then migrate:

```bash
terraform init -migrate-state
```

### 5. Deploy Infrastructure

```bash
# Using Makefile
make plan    # Review
make apply   # Deploy

# Or manual
terraform plan
terraform apply
```

### 6. Confirm Email Subscription

Check your email and confirm the SNS subscription for CloudWatch alarms.

### 7. Deploy Website Content

```bash
make deploy-content
```

## Daily Usage

### Deploy Code Changes

```bash
# From repository root
cd terraform
make deploy-content
```

### Update Infrastructure

```bash
# Make changes to .tf files
terraform plan
terraform apply
```

### View Dashboard

```bash
make show-urls
```

## Common Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make plan` | Preview infrastructure changes |
| `make apply` | Apply infrastructure changes |
| `make deploy-content` | Deploy website files to S3 |
| `make show-urls` | Show important URLs |
| `make output` | Show Terraform outputs |
| `make destroy` | Destroy all infrastructure |

## Troubleshooting

### Issue: "No AWS credentials found"

```bash
aws configure
# Enter your AWS Access Key ID and Secret Access Key
```

### Issue: "State lock" error

```bash
terraform force-unlock <LOCK_ID>
```

### Issue: Can't find ACM certificate

```bash
# List certificates
aws acm list-certificates --region us-east-1

# Create new certificate
aws acm request-certificate \
  --domain-name saiharshavemula.com \
  --subject-alternative-names www.saiharshavemula.com \
  --validation-method DNS \
  --region us-east-1
```

## Important URLs

After deployment:

- **Website**: https://saiharshavemula.com
- **CloudFront Console**: https://console.aws.amazon.com/cloudfront
- **CloudWatch Dashboard**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards
- **S3 Console**: https://s3.console.aws.amazon.com/s3/buckets/

## Get Help

Run: `make show-urls` for all important links

See: [TERRAFORM_DEPLOYMENT_GUIDE.md](../TERRAFORM_DEPLOYMENT_GUIDE.md) for detailed documentation

Contact: vemulasaiharsha@gmail.com
