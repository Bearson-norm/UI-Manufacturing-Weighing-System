# Panduan Setup VPS Deployment dengan GitHub Actions

Panduan lengkap untuk setup deployment otomatis ke VPS menggunakan GitHub Actions.

## 📋 Prerequisites

1. VPS dengan akses SSH
2. Node.js dan npm terinstall di VPS
3. PostgreSQL database di VPS (atau remote database)
4. SSH key untuk akses VPS
5. PM2 untuk process management (opsional, direkomendasikan)

## 🔐 Setup GitHub Secrets

Tambahkan secrets berikut di GitHub repository:

### Database Secrets (Opsional)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: kmi_manufacturing_db)
- `DB_USER` - Database user (default: admin untuk VPS, postgres untuk GitHub Actions)
- `DB_PASSWORD` - Database password (default: admin123 untuk VPS, postgres untuk GitHub Actions)

**Catatan**: 
- Untuk **GitHub Actions CI/CD**: Default user adalah `postgres` karena menggunakan PostgreSQL service container
- Untuk **VPS/Production**: Default user adalah `admin` sesuai dengan setup database di VPS

### VPS Secrets (Wajib untuk deployment)
- `VPS_HOST` - IP address atau domain VPS (contoh: 192.168.1.100 atau example.com)
- `VPS_USER` - SSH user (default: root)
- `VPS_PORT` - SSH port (default: 22)
- `VPS_DEPLOY_PATH` - Path deployment di VPS (default: /var/www/manufacturing-dashboard)
- `VPS_SSH_KEY` - Private SSH key untuk akses VPS

### Application Secrets (Opsional)
- `JWT_SECRET` - Secret key untuk JWT (default: auto-generated)
- `CORS_ORIGIN` - CORS origin (default: http://localhost:3000)

## 🔑 Generate SSH Key untuk GitHub Actions

### 1. Generate SSH Key Pair

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Ini akan membuat 2 file:
# ~/.ssh/github_actions_deploy (private key)
# ~/.ssh/github_actions_deploy.pub (public key)
```

### 2. Copy Public Key ke VPS

```bash
# Copy public key ke VPS
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@your-vps-ip

# Atau manual:
cat ~/.ssh/github_actions_deploy.pub | ssh user@your-vps-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Test SSH Connection

```bash
# Test SSH connection
ssh -i ~/.ssh/github_actions_deploy user@your-vps-ip
```

### 4. Copy Private Key ke GitHub Secrets

```bash
# Copy private key content
cat ~/.ssh/github_actions_deploy

# Copy seluruh output (termasuk -----BEGIN dan -----END)
# Paste ke GitHub Secrets sebagai VPS_SSH_KEY
```

## 📝 Setup GitHub Secrets

1. Buka repository di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan secrets berikut:

| Secret Name | Value | Required |
|------------|-------|----------|
| `VPS_HOST` | IP atau domain VPS | ✅ Yes |
| `VPS_USER` | SSH user (contoh: root) | ✅ Yes |
| `VPS_PORT` | SSH port (default: 22) | ⚠️ Optional |
| `VPS_DEPLOY_PATH` | Path deployment | ⚠️ Optional |
| `VPS_SSH_KEY` | Private SSH key | ✅ Yes |
| `DB_HOST` | Database host | ⚠️ Optional |
| `DB_USER` | Database user | ⚠️ Optional |
| `DB_PASSWORD` | Database password | ⚠️ Optional |
| `JWT_SECRET` | JWT secret key | ⚠️ Optional |
| `CORS_ORIGIN` | CORS origin | ⚠️ Optional |

## 🖥️ Setup VPS

### 1. Install Node.js dan npm

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Setup Timezone

```bash
# Set system timezone to Asia/Bangkok (UTC+7)
sudo timedatectl set-timezone Asia/Bangkok

# Verify timezone
timedatectl
```

### 3. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE kmi_manufacturing_db;
CREATE USER admin WITH PASSWORD 'admin123';
ALTER ROLE admin SET client_encoding TO 'utf8';
ALTER ROLE admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE admin SET timezone TO 'Asia/Bangkok';
GRANT ALL PRIVILEGES ON DATABASE kmi_manufacturing_db TO admin;
\q
EOF
```

### 4. Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup systemd
# Follow the instructions shown
```

### 5. Install and Setup Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Copy Nginx configuration
sudo cp /var/www/manufacturing-dashboard/nginx/kmi-mows.moof-set.web.id.conf /etc/nginx/sites-available/kmi-mows.moof-set.web.id.conf

# Enable site
sudo ln -s /etc/nginx/sites-available/kmi-mows.moof-set.web.id.conf /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d kmi-mows.moof-set.web.id

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Test automatic renewal
sudo certbot renew --dry-run
```

### 7. Setup Deployment Directory

```bash
# Create deployment directory
sudo mkdir -p /var/www/manufacturing-dashboard
sudo chown -R $USER:$USER /var/www/manufacturing-dashboard

# Set proper permissions
chmod -R 755 /var/www/manufacturing-dashboard
```

### 8. Setup Firewall (Jika diperlukan)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow application port (6657)
sudo ufw allow 6657/tcp

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable
```

## 🚀 Workflow Deployment Process

Workflow akan melakukan:

1. **Checkout Code** - Checkout branch KMI-Production
2. **Setup Environment** - Install Node.js dan dependencies
3. **Database Migration** - Setup PostgreSQL dan run migration
4. **Build Frontend** - Build React application
5. **Test** - Test health endpoint
6. **Deploy to VPS** - Copy files ke VPS menggunakan SCP
7. **Setup on VPS** - Install dependencies, run migration, build frontend
8. **Restart Application** - Restart menggunakan PM2

## 📋 Manual Deployment (Jika diperlukan)

Jika deployment otomatis gagal, Anda bisa deploy manual:

```bash
# SSH ke VPS
ssh user@your-vps-ip

# Masuk ke deployment directory
cd /var/www/manufacturing-dashboard

# Pull latest code (jika menggunakan git)
git pull origin KMI-Production

# Install dependencies
npm ci --production
cd client && npm ci --production && cd ..

# Run database migration
npm run db:migrate

# Build frontend
cd client && npm run build && cd ..

# Restart application dengan PM2
pm2 restart manufacturing-dashboard
# atau
pm2 start server/index.js --name manufacturing-dashboard
```

## 🔍 Monitoring dan Logs

### PM2 Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs manufacturing-dashboard

# Restart application
pm2 restart manufacturing-dashboard

# Stop application
pm2 stop manufacturing-dashboard

# Monitor resources
pm2 monit
```

### Application Logs

```bash
# Application logs
tail -f /var/www/manufacturing-dashboard/logs/app.log

# PM2 logs
pm2 logs manufacturing-dashboard
```

## 🛠️ Troubleshooting

### Error: Permission Denied

```bash
# Fix permissions
sudo chown -R $USER:$USER /var/www/manufacturing-dashboard
chmod -R 755 /var/www/manufacturing-dashboard
```

### Error: SSH Connection Failed

1. Verify SSH key di GitHub Secrets
2. Test SSH connection manual: `ssh -i key user@host`
3. Check firewall settings
4. Verify VPS_HOST, VPS_USER, VPS_PORT di secrets

### Error: Database Connection Failed

1. Verify database credentials
2. Check PostgreSQL service: `sudo systemctl status postgresql`
3. Check firewall untuk PostgreSQL port
4. Verify database user permissions

### Error: PM2 Not Found

```bash
# Install PM2
sudo npm install -g pm2

# Or restart manually
cd /var/www/manufacturing-dashboard
node server/index.js
```

## 📊 Environment Variables di VPS

File `.env` akan dibuat otomatis di VPS dengan konfigurasi:

```env
TZ=Asia/Bangkok
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kmi_manufacturing_db
DB_USER=admin
DB_PASSWORD=admin123
NODE_ENV=production
PORT=6657
JWT_SECRET=your_secret_key
CORS_ORIGIN=https://kmi-mows.moof-set.web.id
```

## 🔒 Security Best Practices

1. **Gunakan SSH Key** - Jangan gunakan password untuk SSH
2. **Restrict SSH Access** - Hanya allow IP tertentu jika memungkinkan
3. **Firewall** - Setup firewall dengan rules yang tepat
4. **SSL/TLS** - Setup SSL certificate untuk HTTPS
5. **Environment Variables** - Jangan commit `.env` file
6. **Database Security** - Gunakan strong password untuk database
7. **Regular Updates** - Update sistem dan dependencies secara berkala

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SSH Key Setup Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Catatan**: Pastikan semua secrets sudah di-setup sebelum menjalankan workflow deployment.
