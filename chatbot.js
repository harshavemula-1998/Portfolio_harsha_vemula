const resume = `
Sai Harsha Vemula is a highly skilled DevOps Engineer with over three years of hands-on experience in cloud infrastructure automation, continuous integration and deployment, container orchestration, and systems reliability engineering. He has contributed significantly at Vitrana, Inc., both as an Associate Software DevOps Engineer and a DevOps Intern.

- At Vitrana, led the optimization of Kubernetes manifests, implemented robust GitOps practices using Argo CD, and automated multi-cloud provisioning with Terraform and Ansible.
- Designed and managed secure AWS environments with VPC, EC2, IAM, RDS, ElastiCache, and WAF.
- Integrated Prometheus and Grafana to reduce incident response times by 40% and elevate uptime to 80%.
- Wrote and deployed Lambda functions for automating AWS operations, including EBS snapshots and log cleanup.
- Established secure CI/CD pipelines using GitLab CI, Jenkins, and SonarQube, enabling rapid and reliable deployments.

- Skills: AWS (Advanced), Azure (Intermediate), Terraform, AWS CloudFormation, Ansible, Docker, Kubernetes, Helm, GitLab CI, Jenkins, Argo CD, GitOps, Prometheus, Grafana, ELK Stack, Datadog, IAM, Secrets Manager, WAF, Trivy, JUnit, Java, Python, Shell Scripting, SQL, AWS RDS, MongoDB, Redis, Redshift, Basic front-end (HTML/CSS/JS), Flask, Streamlit

- Certifications: AWS Certified Solutions Architect – Associate, HashiCorp Certified: Terraform Associate, Microsoft Certified: Azure Fundamentals

- Education: Master of Science in Computer Science – University of Missouri-Kansas City, M.Tech in Software Engineering – Vellore Institute of Technology

- Projects: AWS Lambda, DynamoDB, Cognito, API Gateway, Spark + Elasticsearch with Terraform, Spring Boot apps on Kubernetes with CI/CD, Full CI/CD suite on EC2, Federated CNN+ViT for MRI data

- Other: Hosting Portfolio on AWS App Runner, Terraform + Ansible EC2 Automation, NAT Gateway for Private Subnets, Grafana Dashboards for EC2 Logs

- Praised for cloud automation, security enforcement, GitLab workflows, and team collaboration at Vitrana.

- LinkedIn: https://linkedin.com/in/sai-harsha-1a611a1a3/
- Blogs: https://medium.com/@harshaharshuharsha
- Schedule: https://calendly.com/vemulasaiharsha/30min
- Email: vemulasaiharsha@gmail.com
- Phone: +1-816-614-4801
- Location: 402 E 37th St, Kansas City, Missouri 64109
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
        content: `You are a helpful assistant for Sai Harsha Vemula. Here's his resume:\n\n${resume}`
      },
      {
        role: "user",
        content: msgText
      }
    ];

    chatInput.value = '';

    fetch("https://no7xkj12v1.execute-api.us-west-2.amazonaws.com/chat", {
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
