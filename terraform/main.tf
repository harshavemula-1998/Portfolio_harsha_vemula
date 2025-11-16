# Data source for ACM certificate (assuming it already exists)
# If the certificate doesn't exist, you'll need to create it manually first
data "aws_acm_certificate" "website" {
  provider = aws.us_east_1
  domain   = var.domain_name
  statuses = ["ISSUED"]
}

# CloudFront module (created first to get ARN for S3 bucket policy)
module "cloudfront" {
  source = "./modules/cloudfront"

  domain_name                     = var.domain_name
  s3_bucket_regional_domain_name  = module.s3.bucket_regional_domain_name
  acm_certificate_arn             = data.aws_acm_certificate.website.arn
  price_class                     = var.cloudfront_price_class
  enable_logging                  = var.enable_cloudfront_logging
  logs_bucket_domain_name         = var.enable_cloudfront_logging ? module.s3.logs_bucket_domain_name : ""
  tags                            = var.tags
}

# S3 module
module "s3" {
  source = "./modules/s3"

  bucket_name                  = var.domain_name
  enable_versioning            = var.enable_s3_versioning
  enable_logging               = var.enable_cloudfront_logging
  cloudfront_distribution_arn  = module.cloudfront.distribution_arn
  tags                         = var.tags
}

# Route53 module
module "route53" {
  source = "./modules/route53"

  domain_name                 = var.domain_name
  cloudfront_domain_name      = module.cloudfront.distribution_domain_name
  cloudfront_hosted_zone_id   = module.cloudfront.distribution_hosted_zone_id
}

# Monitoring module
module "monitoring" {
  source = "./modules/monitoring"

  project_name               = var.project_name
  cloudfront_distribution_id = module.cloudfront.distribution_id
  alarm_email                = var.alarm_email
  tags                       = var.tags
}
