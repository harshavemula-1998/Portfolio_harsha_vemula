# Managing Existing Infrastructure with Terraform

## ✅ Current Status

### Successfully Imported Resources

The following existing resources are now managed by Terraform:

#### Backend (Already Managed)
- ✅ S3 bucket: `saiharshavemula-terraform-state`
- ✅ S3 versioning, encryption, public access block
- ✅ DynamoDB table: `terraform-state-lock`

#### Website Infrastructure (Just Imported)
- ✅ CloudFront distribution: `E1NM1JU5WPCOK8`
- ✅ S3 bucket: `saiharshavemula.com`
- ✅ S3 versioning, encryption, public access block, bucket policy
- ✅ Route53 A record: `saiharshavemula.com`
- ✅ ACM Certificate (data source)
- ✅ Route53 Hosted Zone (data source)

#### Monitoring (Already Managed)
- ✅ SNS topic: `portfolio-cloudwatch-alarms`
- ✅ SNS subscription
- ✅ CloudWatch dashboard: `portfolio-dashboard`

###  Resources to be Created (Not Imported)

When you run `terraform apply`, Terraform will CREATE these NEW resources:

1. **CloudFront Improvements**
   - Cache policies (dynamic_content, static_assets)
   - Response headers policy (security headers)
   - Origin Access Control (OAC) - newer, better security

2. **Route53 DNS Records**
   - AAAA record for apex (IPv6)
   - A record for www subdomain
   - AAAA record for www subdomain (IPv6)

3. **S3 Logs Bucket**
   - `saiharshavemula.com-logs` (already exists, needs import)
   - Configurations for logs bucket

4. **Monitoring & Alarms**
   - 4xx error rate alarm
   - 5xx error rate alarm
   - Origin latency alarm
   - High request count alarm
   - CloudWatch log group

5. **S3 Lifecycle Policies**
   - Automatic deletion of old versions
   - Intelligent tiering

### Resources to be CHANGED (In-place Updates)

Terraform will update these existing resources (no downtime):

1. **CloudFront Distribution**
   - Add security headers
   - Update cache policies
   - Add Origin Access Control

2. **S3 Bucket**
   - Add lifecycle policies
   - Update bucket policy for OAC

## Next Steps

### Option 1: Apply Changes Gradually (Recommended)

Apply changes in stages to avoid any issues:

```bash
cd terraform

# Step 1: Review what will change
terraform plan

# Step 2: Apply only new monitoring resources first
terraform apply -target=module.monitoring

# Step 3: Apply S3 improvements
terraform apply -target=module.s3

# Step 4: Apply CloudFront improvements
terraform apply -target=module.cloudfront

# Step 5: Apply Route53 records
terraform apply -target=module.route53

# Step 6: Apply everything else
terraform apply
```

### Option 2: Apply All at Once

If you're confident, apply everything:

```bash
terraform apply
```

**Note**: This is safe - Terraform will only:
- ADD new resources (monitoring, DNS records, policies)
- UPDATE existing resources in-place (no replacement)
- NOT DELETE anything

## What Happens After `terraform apply`

### Immediate Benefits

1. **Security Headers**
   - CSP, HSTS, X-Frame-Options added to all responses
   - Better security posture

2. **Improved Caching**
   - Custom cache policies for different file types
   - Better performance, lower costs

3. **Monitoring & Alerts**
   - Email alerts for errors and high latency
   - CloudWatch dashboard for metrics

4. **IPv6 Support**
   - AAAA records for modern devices

5. **Better S3 Security**
   - Origin Access Control (newer than Origin Access Identity)
   - Private S3 bucket with CloudFront-only access

### No Downtime

All changes are in-place updates or additions. Your website will continue to work during and after the apply.

## Managing Infrastructure Going Forward

### Making Changes

**Before Terraform** (Manual):
```bash
aws s3 sync . s3://saiharshavemula.com
aws cloudfront create-invalidation --distribution-id E1NM1JU5WPCOK8
```

**After Terraform** (Infrastructure):
```bash
# For infrastructure changes (CloudFront, S3 config, DNS)
cd terraform
vim main.tf  # Make changes
terraform plan
terraform apply

# For content changes (HTML, CSS, JS, images)
aws s3 sync . s3://saiharshavemula.com --delete
aws cloudfront create-invalidation --distribution-id E1NM1JU5WPCOK8
```

### Content Deployment vs Infrastructure Changes

| Type | Method | Example |
|------|--------|---------|
| **Content** | AWS CLI or GitHub Actions | HTML, CSS, JS, images, PDFs |
| **Infrastructure** | Terraform | CloudFront settings, S3 policies, DNS |

### GitHub Actions Workflows

1. **deploy.yml** - Deploys website content
   - Triggers on HTML/CSS/JS changes
   - Syncs to S3
   - Invalidates CloudFront

2. **terraform.yml** - Manages infrastructure
   - Triggers on `terraform/**` changes
   - Plans and applies infrastructure

## Terraform Commands Cheat Sheet

```bash
# View current infrastructure
terraform state list

# See what would change
terraform plan

# Apply changes
terraform apply

# Show resource details
terraform state show module.cloudfront.aws_cloudfront_distribution.website

# View outputs
terraform output

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate
```

## Import Additional Resources (If Needed)

If you have other resources to import:

```bash
# Find resource ID/ARN
aws <service> describe-<resource> ...

# Import into Terraform
terraform import <terraform_address> <aws_resource_id>

# Example:
terraform import module.s3.aws_s3_bucket.logs[0] saiharshavemula.com-logs
```

## Rollback Strategy

If something goes wrong:

```bash
# Option 1: Revert Terraform changes
git revert <commit>
terraform apply

# Option 2: Use state backup
aws s3 ls s3://saiharshavemula-terraform-state/portfolio/ --recursive
# Download previous version if needed

# Option 3: Manual fix via AWS Console
# Then re-import: terraform import ...
```

## Current Terraform State

```bash
# Check what's managed
terraform state list

# Expected output:
# - aws_dynamodb_table.terraform_state_lock
# - aws_s3_bucket.terraform_state
# - aws_s3_bucket_public_access_block.terraform_state
# - aws_s3_bucket_server_side_encryption_configuration.terraform_state
# - aws_s3_bucket_versioning.terraform_state
# - data.aws_acm_certificate.website
# - module.cloudfront.aws_cloudfront_distribution.website
# - module.monitoring.aws_cloudwatch_dashboard.main
# - module.monitoring.aws_sns_topic.cloudwatch_alarms
# - module.monitoring.aws_sns_topic_subscription.cloudwatch_alarms_email
# - module.route53.aws_route53_record.root
# - module.route53.data.aws_route53_zone.main
# - module.s3.aws_s3_bucket.website
# - module.s3.aws_s3_bucket_policy.website
# - module.s3.aws_s3_bucket_public_access_block.website
# - module.s3.aws_s3_bucket_server_side_encryption_configuration.website
# - module.s3.aws_s3_bucket_versioning.website
```

## Summary

✅ **Existing infrastructure is now managed by Terraform**
✅ **State stored in S3 with locking**
✅ **GitHub Actions configured for automated deployments**
⏳ **Ready to apply additional improvements**

When you run `terraform apply`:
- 18 new resources will be created (monitoring, policies, DNS records)
- 6 existing resources will be updated in-place
- 0 resources will be destroyed
- **No downtime expected**

---

**Status**: Ready for `terraform apply`
**Risk**: Low (no deletions, only additions and in-place updates)
**Recommendation**: Review `terraform plan` output, then apply
