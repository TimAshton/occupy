#!/usr/bin/env bash
# ec2-bootstrap.sh
# Run once on a fresh Amazon Linux 2023 EC2 instance to set up the host.
# Usage: bash ec2-bootstrap.sh
set -euo pipefail

echo "==> Installing Docker"
dnf update -y
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

echo "==> Installing Docker Compose plugin"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version

echo "==> Installing AWS CLI v2"
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip
aws --version

echo "==> Creating app directory with persistent data volume"
mkdir -p /opt/occupy/data
chown -R ec2-user:ec2-user /opt/occupy

echo ""
echo "✅ Bootstrap complete."
echo ""
echo "Next steps:"
echo "  1. Attach an IAM role to this EC2 with AmazonEC2ContainerRegistryReadOnly"
echo "  2. Open port 80 (and 443 if adding HTTPS) in the security group"
echo "  3. Push to main — GitHub Actions will deploy automatically"
