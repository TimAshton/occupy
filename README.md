# OCCUPY

> Claim. Bluff. Conquer. — A territory bluffing game for two players.

A 10×10 grid. 1,000 settlers each. You never see how many settlers your opponent left on a square. Guess right and take it. Guess wrong and lose what you sent.

---

## Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand     |
| Backend  | Node 20, Express, Socket.io               |
| Database | SQLite (better-sqlite3), volume-mounted   |
| Runtime  | Docker + Docker Compose                   |
| Deploy   | AWS EC2 (Amazon Linux 2023) + ECR         |
| CI/CD    | GitHub Actions                            |

---

## Local development

### Prerequisites
- Node 20+
- Docker + Docker Compose

### Option A — Docker (recommended, matches production)

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Client: http://localhost:5173
- Server: http://localhost:3001

### Option B — bare Node (fastest cold start)

```bash
# Install deps
npm ci --prefix client
npm ci --prefix server

# Run both with hot reload
npm run dev
```

---

## Running tests

```bash
npm run test:server   # Vitest — engine, AI, DB
npm run test:client   # Vitest + Testing Library — components
npm test              # both
```

---

## AWS deployment setup (one-time)

### 1. Create ECR repositories

```bash
aws ecr create-repository --repository-name occupy-server --region us-east-1
aws ecr create-repository --repository-name occupy-client --region us-east-1
```

### 2. Launch an EC2 instance

- AMI: **Amazon Linux 2023**
- Instance type: `t3.micro` (free tier) or `t3.small`
- Security group: open **port 80** (HTTP) and **port 22** (SSH, your IP only)
- Storage: 20 GB gp3 (SQLite lives here)
- IAM instance profile: attach a role with **AmazonEC2ContainerRegistryReadOnly**

### 3. Bootstrap the instance

```bash
scp infra/ec2-bootstrap.sh ec2-user@<EC2_HOST>:~
ssh ec2-user@<EC2_HOST> bash ec2-bootstrap.sh
```

### 4. Create a deploy SSH key pair

```bash
ssh-keygen -t ed25519 -C "occupy-deploy" -f ~/.ssh/occupy_deploy -N ""
# Add the public key to the EC2 instance
ssh-copy-id -i ~/.ssh/occupy_deploy.pub ec2-user@<EC2_HOST>
```

### 5. Add GitHub Secrets

Go to **Settings → Secrets → Actions** in your repo and add:

| Secret                  | Value                                              |
|-------------------------|----------------------------------------------------|
| `AWS_ACCESS_KEY_ID`     | IAM user key (needs ECR push + EC2 describe)       |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret                                    |
| `EC2_HOST`              | Public IP or DNS of your EC2 instance              |
| `EC2_USER`              | `ec2-user`                                         |
| `EC2_SSH_KEY`           | Contents of `~/.ssh/occupy_deploy` (private key)   |

### 6. Set your AWS region

Edit `.github/workflows/deploy.yml` and update:
```yaml
env:
  AWS_REGION: us-east-1   # ← change this if needed
```

### 7. Push to main

```bash
git push origin main
```

GitHub Actions will:
1. Run all tests
2. Build both Docker images and push to ECR
3. SSH into EC2, pull the new images, and restart with `docker compose up -d`

---

## Project structure

```
occupy/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Board, ActionPanel, GameStatus, Notification
│   │   ├── hooks/          # useSocket
│   │   ├── pages/          # Home, Game, Join
│   │   ├── store/          # Zustand game store
│   │   └── styles/
│   ├── Dockerfile
│   └── nginx.conf          # Nginx — serves SPA, proxies /api + /socket.io
├── server/                 # Express + Socket.io backend
│   ├── src/
│   │   ├── db/             # SQLite schema + queries
│   │   ├── game/           # engine (pure), AI, socket handler
│   │   └── routes/         # REST API
│   └── Dockerfile
├── shared/                 # gameConstants.js — shared by client + server
├── infra/
│   └── ec2-bootstrap.sh    # One-time EC2 setup script
├── docker-compose.yml      # Production
├── docker-compose.dev.yml  # Local development
└── .github/workflows/
    ├── ci.yml              # PR checks — test only
    └── deploy.yml          # main push — test → build → deploy
```

---

## Game rules

- Each player starts with **1,000 settlers** and zero squares
- On your turn, pick any square:
  - **Empty square** → place any number of your settlers to claim it
  - **Enemy square** → challenge it: commit settlers without seeing how many defend it
- The player with the **most settlers on a square wins it**
- The attacker **always loses** their committed settlers, win or lose
- Game ends when all squares are claimed or a player runs out of settlers
- **Most squares wins**

---

## Roadmap

- [ ] HTTPS via Let's Encrypt / ACM
- [ ] Spectator mode
- [ ] Game history / replay
- [ ] Settler reinforcement mechanic
- [ ] Mobile responsive layout
