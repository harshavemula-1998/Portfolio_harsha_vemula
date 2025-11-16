# Portfolio Infrastructure - Terraform

This directory contains Terraform configurations for managing the complete AWS infrastructure for the portfolio website.

## Architecture

The infrastructure includes:

- **S3 Buckets**: Primary website bucket with versioning, encryption, and lifecycle policies
- **CloudFront Distribution**: Global CDN with custom cache policies and security headers
- **Route53**: DNS records for apex and www domains
- **ACM Certificate**: SSL/TLS certificate for HTTPS
- **CloudWatch**: Alarms and dashboard for monitoring
- **SNS**: Email notifications for alarms

## Directory Structure

```
terraform/
├── modules/
│   ├── s3/              # S3 bucket configuration
│   ├── cloudfront/      # CloudFront distribution with security headers
│   ├── route53/         # DNS configuration
│   └── monitoring/      # CloudWatch alarms and dashboard
├── environments/        # Environment-specific configurations
│   ├── prod/
│   └── dev/
├── main.tf             # Main configuration
├── variables.tf        # Variable definitions
├── outputs.tf          # Output values
├── providers.tf        # Provider configurations
├── versions.tf         # Terraform and provider versions
├── backend-setup.tf    # S3 backend setup (run first)
└── terraform.tfvars.example  # Example variables file
```

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.5.0 installed
3. **Existing ACM certificate** for your domain in us-east-1 region
4. **Existing Route53 hosted zone** for your domain

## Initial Setup

### Step 1: Set Up Terraform State Backend

First, create the S3 bucket and DynamoDB table for Terraform state management:

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the backend setup plan
terraform plan -target=aws_s3_bucket.terraform_state \
               -target=aws_dynamodb_table.terraform_state_lock

# Apply the backend setup
terraform apply -target=aws_s3_bucket.terraform_state \
                -target=aws_dynamodb_table.terraform_state_lock
```

### Step 2: Configure Remote State Backend

After the backend resources are created, uncomment the backend configuration in `versions.tf`:

```hcl
backend "s3" {
  bucket         = "saiharshavemula-terraform-state"
  key            = "portfolio/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "terraform-state-lock"
}
```

Then migrate the state:

```bash
terraform init -migrate-state
```

### Step 3: Configure Variables

Create a `terraform.tfvars` file from the example:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
domain_name              = "saiharshavemula.com"
environment              = "prod"
project_name             = "portfolio"
enable_cloudfront_logging = true
enable_s3_versioning     = true
cloudfront_price_class   = "PriceClass_100"
alarm_email              = "your-email@example.com"
```

### Step 4: Deploy Infrastructure

```bash
# Initialize Terraform (if not already done)
terraform init

# Review the execution plan
terraform plan

# Apply the configuration
terraform apply

# Confirm SNS subscription
# Check your email and confirm the SNS subscription for CloudWatch alarms
```

## Security Features

### S3 Bucket Security
- Server-side encryption (AES256)
- Versioning enabled for rollback capability
- Public access blocked (CloudFront accesses via OAC)
- Lifecycle policies for cost optimization

### CloudFront Security Headers
- **Content-Security-Policy**: Restricts resource loading
- **Strict-Transport-Security**: Enforces HTTPS (HSTS)
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### Network Security
- TLS 1.2 minimum protocol version
- Origin Access Control (OAC) for S3
- DDoS protection via CloudFront

## Monitoring

### CloudWatch Alarms
- **4xx Error Rate**: Alerts when > 5% for 10 minutes
- **5xx Error Rate**: Alerts when > 1% for 10 minutes
- **Origin Latency**: Alerts when > 1000ms for 10 minutes
- **High Request Count**: Alerts for potential DDoS (> 100k requests in 5 min)

### CloudWatch Dashboard
Access the dashboard at: `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:`

Metrics included:
- Total requests
- Error rates (4xx, 5xx)
- Data transfer
- Origin latency
- Cache hit rate

## Deployment Workflow

### Manual Deployment

After infrastructure is set up, deploy website content:

```bash
# Get deployment commands from Terraform output
terraform output -raw deployment_commands

# Or manually sync files
aws s3 sync . s3://saiharshavemula.com \
  --exclude ".git/*" \
  --exclude ".github/*" \
  --exclude "terraform/*" \
  --exclude "*.md" \
  --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

### Automated Deployment (GitHub Actions)

See the GitHub Actions workflow in `.github/workflows/deploy.yml` for automated deployment.

## Common Operations

### Update Infrastructure

```bash
# Make changes to .tf files
# Review changes
terraform plan

# Apply changes
terraform apply
```

### View Current State

```bash
# List all resources
terraform state list

# Show specific resource
terraform state show module.cloudfront.aws_cloudfront_distribution.website

# View outputs
terraform output
```

### Destroy Infrastructure

**WARNING**: This will delete all infrastructure!

```bash
# Review what will be destroyed
terraform plan -destroy

# Destroy infrastructure
terraform destroy
```

### Refresh State

```bash
# Update state to match real infrastructure
terraform refresh
```

## Cost Optimization

### Current Configuration
- **S3**: Pay-per-use with lifecycle policies
  - Old versions moved to STANDARD_IA after 30 days
  - Deleted after 90 days
- **CloudFront**: PriceClass_100 (North America & Europe only)
- **DynamoDB**: Pay-per-request billing mode
- **CloudWatch**: Free tier for basic metrics

### Estimated Monthly Cost
- **S3**: ~$0.50 - $2.00
- **CloudFront**: ~$1.00 - $5.00 (based on traffic)
- **Route53**: ~$0.50
- **DynamoDB**: < $0.25
- **CloudWatch**: Free tier
- **Total**: ~$2 - $8 per month

## Troubleshooting

### Issue: ACM Certificate Not Found

Ensure you have a valid ACM certificate in `us-east-1` region:

```bash
aws acm list-certificates --region us-east-1
```

If not, request one:

```bash
aws acm request-certificate \
  --domain-name saiharshavemula.com \
  --subject-alternative-names www.saiharshavemula.com \
  --validation-method DNS \
  --region us-east-1
```

### Issue: Route53 Hosted Zone Not Found

Verify your hosted zone exists:

```bash
aws route53 list-hosted-zones
```

### Issue: State Lock Error

If Terraform is stuck with a state lock:

```bash
# Force unlock (use with caution!)
terraform force-unlock <LOCK_ID>
```

### Issue: CloudFront Distribution Takes Long to Deploy

CloudFront distributions typically take 15-30 minutes to deploy or update. This is normal AWS behavior.

## Best Practices

1. **Always run `terraform plan`** before `apply`
2. **Use workspaces** for multiple environments
3. **Version control** all `.tf` files (but not `.tfvars`)
4. **Enable state locking** (already configured with DynamoDB)
5. **Use modules** for reusable components (already implemented)
6. **Tag all resources** for cost tracking and management
7. **Regular backups** (S3 versioning handles this)
8. **Review security groups** and IAM policies periodically

## Maintenance

### Regular Tasks
- Review CloudWatch alarms monthly
- Check S3 bucket lifecycle policies quarterly
- Audit IAM permissions quarterly
- Review CloudFront cache statistics monthly
- Update Terraform and provider versions quarterly

### Updates
- Monitor AWS service updates
- Review Terraform changelog for new features
- Update provider versions in `versions.tf`

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## Support

For issues or questions:
- Open an issue in the GitHub repository
- Email: vemulasaiharsha@gmail.com

---

**Managed by**: Sai Harsha Vemula
**Last Updated**: November 2025
**Terraform Version**: >= 1.5.0
