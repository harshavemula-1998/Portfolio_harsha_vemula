variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "cloudfront_distribution_id" {
  description = "CloudFront distribution ID to monitor"
  type        = string
}

variable "alarm_email" {
  description = "Email address for CloudWatch alarms"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
