output "bucket_id" {
  description = "The ID of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "bucket_domain_name" {
  description = "The bucket domain name"
  value       = aws_s3_bucket.website.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "The bucket regional domain name"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

output "logs_bucket_id" {
  description = "The ID of the logs S3 bucket"
  value       = var.enable_logging ? aws_s3_bucket.logs[0].id : null
}

output "logs_bucket_domain_name" {
  description = "The logs bucket domain name"
  value       = var.enable_logging ? aws_s3_bucket.logs[0].bucket_domain_name : null
}
