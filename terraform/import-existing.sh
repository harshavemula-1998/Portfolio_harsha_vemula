#!/bin/bash
# Import existing infrastructure into Terraform state

set -e

echo "Importing existing portfolio infrastructure..."

# Create terraform.tfvars if it doesn't exist
if [ ! -f terraform.tfvars ]; then
    echo "Creating terraform.tfvars from example..."
    cp terraform.tfvars.example terraform.tfvars
    echo "⚠️  Please edit terraform.tfvars with your actual values before continuing!"
    echo "Press Enter when ready..."
    read
fi

# CloudFront Distribution (already exists)
CLOUDFRONT_ID="E1NM1JU5WPCOK8"

echo "Step 1: Importing CloudFront distribution..."
terraform import module.cloudfront.aws_cloudfront_distribution.website $CLOUDFRONT_ID || true

echo "Step 2: Importing CloudFront Origin Access Control..."
# Get OAC ID from CloudFront distribution
OAC_ID=$(aws cloudfront get-distribution --id $CLOUDFRONT_ID --query 'Distribution.DistributionConfig.Origins.Items[0].OriginAccessControlId' --output text)
if [ "$OAC_ID" != "None" ] && [ "$OAC_ID" != "" ]; then
    terraform import module.cloudfront.aws_cloudfront_origin_access_control.website $OAC_ID || true
fi

echo "Step 3: Importing S3 website bucket..."
terraform import module.s3.aws_s3_bucket.website saiharshavemula.com || true

echo "Step 4: Importing S3 bucket configurations..."
terraform import module.s3.aws_s3_bucket_versioning.website saiharshavemula.com || true
terraform import module.s3.aws_s3_bucket_server_side_encryption_configuration.website saiharshavemula.com || true
terraform import module.s3.aws_s3_bucket_public_access_block.website saiharshavemula.com || true
terraform import module.s3.aws_s3_bucket_policy.website saiharshavemula.com || true

echo "Step 5: Importing S3 logs bucket..."
terraform import 'module.s3.aws_s3_bucket.logs[0]' saiharshavemula.com-logs || true
terraform import 'module.s3.aws_s3_bucket_server_side_encryption_configuration.logs[0]' saiharshavemula.com-logs || true
terraform import 'module.s3.aws_s3_bucket_public_access_block.logs[0]' saiharshavemula.com-logs || true
terraform import 'module.s3.aws_s3_bucket_ownership_controls.logs[0]' saiharshavemula.com-logs || true

echo "Step 6: Importing Route53 records..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='saiharshavemula.com.'].Id" --output text | cut -d'/' -f3)

# Import A record for apex domain
terraform import module.route53.aws_route53_record.root ${HOSTED_ZONE_ID}_saiharshavemula.com_A || true

# Import AAAA record for apex domain
terraform import module.route53.aws_route53_record.root_ipv6 ${HOSTED_ZONE_ID}_saiharshavemula.com_AAAA || true

# Import A record for www subdomain
terraform import module.route53.aws_route53_record.www ${HOSTED_ZONE_ID}_www.saiharshavemula.com_A || true

# Import AAAA record for www subdomain
terraform import module.route53.aws_route53_record.www_ipv6 ${HOSTED_ZONE_ID}_www.saiharshavemula.com_AAAA || true

echo ""
echo "✅ Import complete!"
echo ""
echo "Next steps:"
echo "1. Run: terraform plan"
echo "2. Review the changes (should show mostly in-place updates)"
echo "3. Run: terraform apply"
echo ""
