output "website_url" {
  description = "The URL of the website"
  value       = "https://${var.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = module.cloudfront.distribution_domain_name
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = module.s3.bucket_id
}

output "s3_bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = module.s3.bucket_arn
}

output "route53_zone_id" {
  description = "The Route53 hosted zone ID"
  value       = module.route53.zone_id
}

output "route53_name_servers" {
  description = "The Route53 name servers"
  value       = module.route53.name_servers
}

output "cloudwatch_dashboard_name" {
  description = "The name of the CloudWatch dashboard"
  value       = module.monitoring.dashboard_name
}

output "sns_topic_arn" {
  description = "The ARN of the SNS topic for alarms"
  value       = module.monitoring.sns_topic_arn
}

output "deployment_commands" {
  description = "Commands to deploy website content"
  value       = <<-EOT
    # Sync files to S3
    aws s3 sync . s3://${module.s3.bucket_id} \
      --exclude ".git/*" \
      --exclude ".github/*" \
      --exclude "terraform/*" \
      --exclude "*.md" \
      --delete

    # Invalidate CloudFront cache
    aws cloudfront create-invalidation \
      --distribution-id ${module.cloudfront.distribution_id} \
      --paths "/*"
  EOT
}
