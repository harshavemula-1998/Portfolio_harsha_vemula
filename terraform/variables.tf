variable "domain_name" {
  description = "Primary domain name for the portfolio website"
  type        = string
  default     = "saiharshavemula.com"
}

variable "environment" {
  description = "Environment name (prod, dev, staging)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "portfolio"
}

variable "enable_cloudfront_logging" {
  description = "Enable CloudFront access logging"
  type        = bool
  default     = true
}

variable "enable_s3_versioning" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "CloudFront distribution price class"
  type        = string
  default     = "PriceClass_100" # Use only North America and Europe
}

variable "alarm_email" {
  description = "Email address for CloudWatch alarms"
  type        = string
  default     = "vemulasaiharsha@gmail.com"
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "Portfolio"
    ManagedBy   = "Terraform"
    Owner       = "Sai Harsha Vemula"
    Environment = "Production"
  }
}
