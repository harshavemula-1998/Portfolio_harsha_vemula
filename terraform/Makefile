.PHONY: help init plan apply destroy fmt validate clean backend-setup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

init: ## Initialize Terraform
	terraform init

backend-setup: ## Set up S3 backend and DynamoDB table
	terraform init
	terraform plan -target=aws_s3_bucket.terraform_state -target=aws_dynamodb_table.terraform_state_lock
	terraform apply -target=aws_s3_bucket.terraform_state -target=aws_dynamodb_table.terraform_state_lock
	@echo "\n=== Backend setup complete! ==="
	@echo "Now uncomment the backend block in versions.tf and run:"
	@echo "  terraform init -migrate-state"

plan: ## Show execution plan
	terraform plan

apply: ## Apply Terraform configuration
	terraform apply

apply-auto: ## Apply Terraform configuration without confirmation
	terraform apply -auto-approve

destroy: ## Destroy all infrastructure
	terraform destroy

destroy-auto: ## Destroy all infrastructure without confirmation
	terraform destroy -auto-approve

fmt: ## Format Terraform files
	terraform fmt -recursive

validate: ## Validate Terraform files
	terraform validate

clean: ## Clean Terraform files
	rm -rf .terraform/
	rm -f .terraform.lock.hcl
	rm -f terraform.tfstate*
	rm -f *.tfplan

output: ## Show Terraform outputs
	terraform output

refresh: ## Refresh Terraform state
	terraform refresh

graph: ## Generate dependency graph
	terraform graph | dot -Tsvg > graph.svg
	@echo "Graph saved to graph.svg"

state-list: ## List all resources in state
	terraform state list

cost-estimate: ## Estimate infrastructure costs (requires infracost)
	@if command -v infracost >/dev/null 2>&1; then \
		terraform plan -out=tfplan.binary; \
		terraform show -json tfplan.binary > plan.json; \
		infracost breakdown --path plan.json; \
		rm -f tfplan.binary plan.json; \
	else \
		echo "infracost not installed. Install from: https://www.infracost.io/docs/"; \
	fi

security-scan: ## Run security scan with tfsec
	@if command -v tfsec >/dev/null 2>&1; then \
		tfsec .; \
	else \
		echo "tfsec not installed. Install from: https://github.com/aquasecurity/tfsec"; \
	fi

lint: ## Lint Terraform files with tflint
	@if command -v tflint >/dev/null 2>&1; then \
		tflint --init; \
		tflint; \
	else \
		echo "tflint not installed. Install from: https://github.com/terraform-linters/tflint"; \
	fi

docs: ## Generate documentation with terraform-docs
	@if command -v terraform-docs >/dev/null 2>&1; then \
		terraform-docs markdown table . > TERRAFORM_DOCS.md; \
		echo "Documentation generated in TERRAFORM_DOCS.md"; \
	else \
		echo "terraform-docs not installed. Install from: https://terraform-docs.io/"; \
	fi

check-drift: ## Check for infrastructure drift
	terraform plan -detailed-exitcode

deploy-content: ## Deploy website content to S3
	@BUCKET_ID=$$(terraform output -raw s3_bucket_name 2>/dev/null); \
	DIST_ID=$$(terraform output -raw cloudfront_distribution_id 2>/dev/null); \
	if [ -z "$$BUCKET_ID" ] || [ -z "$$DIST_ID" ]; then \
		echo "Error: Infrastructure not deployed yet. Run 'make apply' first."; \
		exit 1; \
	fi; \
	cd .. && \
	aws s3 sync . s3://$$BUCKET_ID \
		--exclude ".git/*" \
		--exclude ".github/*" \
		--exclude "terraform/*" \
		--exclude "*.md" \
		--exclude ".DS_Store" \
		--delete && \
	aws cloudfront create-invalidation \
		--distribution-id $$DIST_ID \
		--paths "/*" && \
	echo "Content deployed successfully!"

show-urls: ## Show important URLs
	@echo "=== Portfolio Infrastructure URLs ==="
	@echo "Website URL:           $$(terraform output -raw website_url 2>/dev/null || echo 'Not deployed')"
	@echo "CloudFront Dashboard:  https://console.aws.amazon.com/cloudfront/home"
	@echo "CloudWatch Dashboard:  https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=$$(terraform output -raw cloudwatch_dashboard_name 2>/dev/null || echo 'Not deployed')"
	@echo "S3 Console:            https://s3.console.aws.amazon.com/s3/buckets/$$(terraform output -raw s3_bucket_name 2>/dev/null || echo 'Not deployed')"

full-deployment: init plan apply deploy-content ## Full deployment: init, plan, apply, and deploy content
	@echo "=== Full deployment complete! ==="
	@make show-urls
