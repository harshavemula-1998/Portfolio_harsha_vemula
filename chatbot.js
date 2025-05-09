const resume = `
Sai Harsha Vemula is a highly skilled DevOps Engineer with over three years of hands-on experience in cloud infrastructure automation, continuous integration and deployment, container orchestration, and systems reliability engineering. He has contributed significantly at Vitrana, Inc., both as an Associate Software DevOps Engineer and a DevOps Intern.

$1
- At Vitrana, led the optimization of Kubernetes manifests, implemented robust GitOps practices using Argo CD, and automated multi-cloud provisioning with Terraform and Ansible.
- Designed and managed secure AWS environments with VPC, EC2, IAM, RDS, ElastiCache, and WAF.
- Integrated Prometheus and Grafana to reduce incident response times by 40% and elevate uptime to 80%.
- Wrote and deployed Lambda functions for automating AWS operations, including EBS snapshots and log cleanup.
- Established secure CI/CD pipelines using GitLab CI, Jenkins, and SonarQube, enabling rapid and reliable deployments.

$1
- $1: AWS (Advanced), Azure (Intermediate)
- $1: Terraform, AWS CloudFormation, Ansible
- $1: Docker, Kubernetes, Helm
- $1: GitLab CI, Jenkins, Argo CD, GitOps
- $1: Prometheus, Grafana, ELK Stack, Datadog
- $1: IAM, Secrets Manager, WAF, Trivy, JUnit
- $1: Java, Python, Shell Scripting, SQL
- $1: AWS RDS, MongoDB, Redis, Redshift
- $1: Basic front-end (HTML/CSS/JS), Flask, Streamlit

$1
- AWS Certified Solutions Architect – Associate
- HashiCorp Certified: Terraform Associate
- Microsoft Certified: Azure Fundamentals

$1
- Master of Science in Computer Science – University of Missouri-Kansas City
- M.Tech in Software Engineering – Vellore Institute of Technology

$1
- $1: AWS Lambda, DynamoDB, Cognito, API Gateway
- $1: Spark + Elasticsearch with Terraform for AWS provisioning
- $1: Spring Boot apps on Kubernetes with CI/CD automation
- $1: Full CI/CD suite on EC2 with containerized runners
- $1: Privacy-preserving CNN+ViT hybrid model trained on decentralized MRI data

$1
- Hosting a Portfolio on AWS App Runner
- Terraform + Ansible EC2 Automation
- NAT Gateway with Private Subnet Connectivity
- Grafana Dashboards for EC2 Logs

$1
- Praised for cloud automation, security enforcement, GitLab workflows, and proactive team collaboration by multiple team leads and peers at Vitrana.

$1
- LinkedIn: https://linkedin.com/in/sai-harsha-1a611a1a3/
- Blogs: https://medium.com/@harshaharshuharsha
- Schedule: https://calendly.com/vemulasaiharsha/30min
- Email: vemulasaiharsha@gmail.com
- Phone: +18166144801
- Location: 402 e 37th st,Kansas City,Missouri,64109
`;


function showChat() {
  const widget = document.getElementById("chat-widget");
  const toggle = document.getElementById("chat-toggle");
  if (widget) widget.style.display = "flex";
  if (toggle) toggle.style.display = "none";
}

function closeChat() {
  const widget = document.getElementById("chat-widget");
  const toggle = document.getElementById("chat-toggle");
  if (widget) widget.style.display = "none";
  if (toggle) toggle.style.display = "block";
}

window.addEventListener("DOMContentLoaded", () => {
  showChat();
});

document.addEventListener("DOMContentLoaded", () => {
  const chatInput = document.getElementById("chat-input");
  const chatBody = document.getElementById("chat-body");

  function sendMessage(msgText) {
    chatBody.innerHTML += `<div class="user-msg"><strong>You:</strong> ${msgText}</div>`;

    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant for Sai Harsha Vemula. Only answer questions based on the following resume:\n\n${resume}\n\nIf the user asks anything unrelated to this resume, politely respond with: "Sorry, I can only answer questions about Sai Harsha Vemula's resume."`
      },
      {
        role: "user",
        content: msgText
      }
    ];

    chatInput.value = '';

    fetch("https://rfh4nztbkj.execute-api.us-west-2.amazonaws.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages })
    })
    .then(res => res.json())
    .then(data => {
      chatBody.innerHTML += `<div class="bot-msg"><strong>Bot:</strong> ${data.reply}</div>`;
      chatBody.scrollTop = chatBody.scrollHeight;
    })
    .catch(() => {
      chatBody.innerHTML += `<div class="bot-msg" style="color:red;">❌ Failed to fetch response.</div>`;
    });
  }

  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && chatInput.value.trim()) {
      sendMessage(chatInput.value.trim());
    }
  });
});
