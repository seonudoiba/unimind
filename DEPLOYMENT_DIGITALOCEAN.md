# 🚀 DigitalOcean Ubuntu Droplet Deployment Guide

Complete step-by-step guide to deploying the **UniMindKidz Backend** (Node.js, Express, Prisma, PostgreSQL, PM2, and Nginx) to a **DigitalOcean Ubuntu Droplet**.

---

## 📋 Table of Contents
1. [Droplet Requirements & Creation](#1-droplet-requirements--creation)
2. [Initial Server Setup & Security](#2-initial-server-setup--security)
3. [Install Node.js, PM2, & Nginx](#3-install-nodejs-pm2--nginx)
4. [Set Up PostgreSQL Database](#4-set-up-postgresql-database)
5. [Clone & Configure the Backend](#5-clone--configure-the-backend)
6. [Initialize Database & Seed Data](#6-initialize-database--seed-data)
7. [Start Backend with PM2 Process Manager](#7-start-backend-with-pm2-process-manager)
8. [Configure Nginx Reverse Proxy](#8-configure-nginx-reverse-proxy)
9. [Set Up SSL (HTTPS) with Certbot](#9-set-up-ssl-https-with-certbot)
10. [Connect Frontend & Test](#10-connect-frontend--test)
11. [Routine Maintenance & Updates](#11-routine-maintenance--updates)

---

## 1. Droplet Requirements & Creation

1. Log in to [DigitalOcean Cloud Console](https://cloud.digitalocean.com/).
2. Click **Create** → **Droplets**.
3. Choose the following settings:
   - **Image**: Ubuntu 22.04 LTS (or 24.04 LTS) x64
   - **Plan**: Basic (Regular or Premium AMD/Intel)
   - **Size**: **1 GB RAM / 1 vCPU / 25 GB SSD** ($6/mo) is sufficient for initial production; **2 GB RAM / 1 vCPU** ($12/mo) is recommended if running PostgreSQL on the same droplet.
   - **Datacenter Region**: Choose the region closest to your users (e.g., New York `NYC1`, San Francisco `SFO3`, London `LON1`, Frankfurt `FRA1`).
   - **Authentication**: **SSH Key** (Recommended) or Strong Root Password.
4. Click **Create Droplet**. Note down your **Droplet Public IPv4 Address** (e.g., `164.92.123.45`).

---

## 2. Initial Server Setup & Security

Connect to your droplet via SSH from your terminal:

```bash
ssh root@YOUR_DROPLET_IP
```

### Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw build-essential
```

### Configure UFW Firewall
```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable
sudo ufw status
```

---

## 3. Install Node.js, PM2, & Nginx

### Install Node.js 20 LTS (NodeSource)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v   # Should output v20.x.x
npm -v    # Should output v10.x.x
```

### Install PM2 Globally
```bash
sudo npm install -g pm2
```

### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 4. Set Up PostgreSQL Database

You have two options:
- **Option A (Self-Hosted on Droplet - FREE)**: Follow the steps below.
- **Option B (DigitalOcean Managed Database)**: Create a Managed PostgreSQL cluster in DigitalOcean and copy the connection string.

### Option A: Install & Configure PostgreSQL Locally on Droplet

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start & enable service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Switch to postgres user and open PostgreSQL CLI
sudo -u postgres psql
```

Inside the `psql` console, create the database, user, and grant privileges (replace `YourSecurePassword123!` with a strong password):

```sql
CREATE DATABASE unimind_db;
CREATE USER unimind_user WITH ENCRYPTED PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE unimind_db TO unimind_user;
ALTER DATABASE unimind_db OWNER TO unimind_user;
\q
```

Your PostgreSQL connection string will be:
```
postgresql://unimind_user:YourSecurePassword123!@localhost:5432/unimind_db?schema=public
```

---

## 5. Clone & Configure the Backend

### Prepare Application Directory
```bash
sudo mkdir -p /var/www/unimind-assessment
sudo chown -R $USER:$USER /var/www/unimind-assessment
cd /var/www/unimind-assessment
```

### Clone Your Repository
```bash
git clone https://github.com/YOUR_USERNAME/unimind-assessment.git .
cd backend
```

### Create Production Environment File (`.env`)
```bash
cp .env.example .env
nano .env
```

Paste and customize your production variables:

```env
NODE_ENV=production
PORT=5000

# PostgreSQL Connection String
DATABASE_URL="postgresql://unimind_user:YourSecurePassword123!@localhost:5432/unimind_db?schema=public"

# JWT Secret (Generate random string: `openssl rand -hex 32`)
JWT_SECRET="YOUR_RANDOM_SECURE_JWT_SECRET_STRING"
JWT_EXPIRES_IN="7d"

# Default Admin Account
ADMIN_EMAIL="denise@theunimindproject.org"
ADMIN_PASSWORD="UniMindAdmin2024!"

# Frontend URL (For CORS whitelist)
FRONTEND_URL="https://your-frontend.vercel.app"

# Cloudinary (Optional, for hosted audio storage)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

Press `Ctrl + O`, then `Enter` to save, and `Ctrl + X` to exit `nano`.

---

## 6. Initialize Database & Seed Data

Install dependencies and run Prisma commands:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push database schema to PostgreSQL
npx prisma db push

# Seed initial curriculum and admin account
npm run db:seed
```

You should see:
```
🌱 Starting seed...
✅ Admin created: denise@theunimindproject.org
✅ Grade created: Kindergarten
✅ Week created: Belonging & Community
✅ Day created: Welcome to Our Class Family
🎉 Seed completed successfully!
```

---

## 7. Start Backend with PM2 Process Manager

We have included a production-ready `ecosystem.config.cjs` with clustering and log management.

```bash
# Create logs directory
mkdir -p logs uploads

# Start backend using PM2 cluster mode
pm2 start ecosystem.config.cjs --env production

# Check status
pm2 status

# Configure PM2 to automatically restart on droplet reboot
pm2 startup
# (Copy and run the command printed by the command above)

# Save current PM2 state
pm2 save
```

### Useful PM2 Commands:
```bash
pm2 logs unimind-backend       # View live logs
pm2 reload unimind-backend     # Zero-downtime restart
pm2 restart unimind-backend    # Hard restart
pm2 stop unimind-backend       # Stop application
pm2 monit                      # CPU & Memory monitor
```

---

## 8. Configure Nginx Reverse Proxy

Nginx will receive web traffic on port 80/443 and proxy it to our Node.js app on `http://127.0.0.1:5000`.

### Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/unimind-api
```

Paste the following (replace `api.yourdomain.com` with your domain or Droplet IP if not using a domain):

```nginx
server {
    listen 80;
    server_name api.yourdomain.com; # or your droplet IP: 164.92.123.45

    client_max_body_size 50M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /uploads/ {
        alias /var/www/unimind-assessment/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }
}
```

### Enable Site & Test Nginx
```bash
# Enable the site configuration
sudo ln -sf /etc/nginx/sites-available/unimind-api /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Test Backend Health Check:
```bash
curl http://localhost:5000/api/health
# Or from your browser:
# http://YOUR_DROPLET_IP/api/health
```

Expected output:
```json
{"status":"OK","timestamp":"...","uptime":12.34,"version":"1.0.0","environment":"production"}
```

---

## 9. Set Up SSL (HTTPS) with Certbot

*(Recommended if you have a custom domain pointing to your droplet IP via an A record)*

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Test automatic SSL renewal
sudo certbot renew --dry-run
```

Certbot automatically configures HTTPS redirect and SSL certificates for you!

---

## 10. Connect Frontend & Test

In your frontend project (e.g. deployed on Vercel/Netlify or local development):

1. Set the frontend environment variable:
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   # Or without domain: http://YOUR_DROPLET_IP/api
   ```
2. Re-deploy your frontend.
3. Test logging in via `https://your-frontend-domain.com/admin/login`:
   - **Email**: `denise@theunimindproject.org`
   - **Password**: `UniMindAdmin2024!`

---

## 11. Routine Maintenance & Updates

To deploy future updates to the backend on your droplet, simply run the included `deploy.sh` script:

```bash
cd /var/www/unimind-assessment/backend
chmod +x deploy.sh
./deploy.sh
```

The script automatically:
1. Pulls the latest code from GitHub (`git pull`).
2. Installs any new dependencies (`npm ci`).
3. Runs Prisma schema migrations (`npx prisma db push`).
4. Performs a zero-downtime reload with PM2 (`pm2 reload ecosystem.config.cjs`).
