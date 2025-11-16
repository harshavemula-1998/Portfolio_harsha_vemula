provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = var.tags
  }
}

# CloudFront requires ACM certificates in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = var.tags
  }
}
