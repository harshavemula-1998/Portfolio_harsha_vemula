# Sai Harsha Vemula - Portfolio

[![Deploy to S3 and CloudFront](https://github.com/harshavemula-1998/Portfolio_harsha_vemula/actions/workflows/deploy.yml/badge.svg)](https://github.com/harshavemula-1998/Portfolio_harsha_vemula/actions/workflows/deploy.yml)

Professional portfolio website showcasing my experience as a DevOps Engineer with automated deployment pipeline.

## Live Website
🔗 **[https://saiharshavemula.com](https://saiharshavemula.com)**

## Features

- ✅ **Automated CI/CD Pipeline** - GitHub Actions workflow for deployment
- ✅ **Security Scanning** - Trivy vulnerability scanning on every commit
- ✅ **S3 Hosting** - Static website hosting on AWS S3
- ✅ **CloudFront CDN** - Global content delivery with automatic cache invalidation
- ✅ **Optimized Caching** - Smart cache headers for performance
- ✅ **Responsive Design** - Mobile-friendly portfolio layout
- ✅ **Interactive Chatbot** - AI-powered assistant to answer questions

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript
- Bootstrap 4
- jQuery
- AOS (Animate On Scroll)
- Owl Carousel

**Infrastructure:**
- AWS S3 (Static hosting)
- AWS CloudFront (CDN)
- GitHub Actions (CI/CD)
- Trivy (Security scanning)

## Automated Deployment

This repository uses GitHub Actions to automatically:
1. Run security scans with Trivy
2. Validate HTML/CSS/JS files
3. Sync files to S3 bucket
4. Invalidate CloudFront cache
5. Deploy changes globally within minutes

### Workflow Status
View the latest deployment: [Actions Tab](https://github.com/harshavemula-1998/Portfolio_harsha_vemula/actions)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/harshavemula-1998/Portfolio_harsha_vemula.git
cd Portfolio_harsha_vemula
```

2. Open `index.html` in your browser or use a local server:
```bash
python3 -m http.server 8000
```

3. Visit: `http://localhost:8000`

## Deployment

Every push to the `main` branch automatically triggers deployment. No manual intervention required!

## Security

- Trivy scans for vulnerabilities in dependencies
- GitHub Secret Scanning enabled
- Automated security updates via Dependabot
- Regular security audits

## Contact

- **Website**: [saiharshavemula.com](https://saiharshavemula.com)
- **LinkedIn**: [Sai Harsha Vemula](https://www.linkedin.com/in/sai-harsha-vemula-1a611a1a3)
- **Email**: vemulasaiharsha@gmail.com

---

**Last Updated**: November 16, 2025

