# 🚀 **Production Deployment Guide - Peykan Tourism**

## 📋 **Overview**

This guide provides step-by-step instructions for deploying the Peykan Tourism Reservation System to production.

## 🏗️ **System Requirements**

### **Server Requirements**
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 50GB+ SSD
- **Network**: Stable internet connection

### **Software Requirements**
- **Python**: 3.11+
- **PostgreSQL**: 13+
- **Redis**: 6+
- **Nginx**: 1.18+
- **Docker**: 20.10+ (optional)
- **Docker Compose**: 2.0+ (optional)

## 🔧 **Installation Steps**

### **1. Server Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib redis-server nginx git curl

# Install Node.js (for frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **2. Database Setup**

```bash
# Create PostgreSQL user and database
sudo -u postgres psql

CREATE USER peykan_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE peykan_tourism OWNER peykan_user;
GRANT ALL PRIVILEGES ON DATABASE peykan_tourism TO peykan_user;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/13/main/postgresql.conf
# Add/modify:
# max_connections = 100
# shared_buffers = 256MB
# effective_cache_size = 1GB

sudo systemctl restart postgresql
```

### **3. Application Setup**

```bash
# Create application directory
sudo mkdir -p /opt/peykan-tourism
sudo chown $USER:$USER /opt/peykan-tourism
cd /opt/peykan-tourism

# Clone repository
git clone https://github.com/your-org/peykan-tourism.git .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### **4. Environment Configuration**

```bash
# Create environment file
cp backend/peykan/.env.example backend/peykan/.env

# Edit environment variables
nano backend/peykan/.env
```

**Required Environment Variables:**
```env
# Django Settings
DEBUG=False
SECRET_KEY=your_very_secure_secret_key_here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DATABASE_URL=postgresql://peykan_user:your_secure_password@localhost:5432/peykan_tourism

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_BACKEND=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# JWT Settings
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=1440

# Payment Gateway (if applicable)
PAYMENT_GATEWAY_API_KEY=your_payment_gateway_key
PAYMENT_GATEWAY_SECRET=your_payment_gateway_secret

# File Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=your-region

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### **5. Database Migration**

```bash
cd backend

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create initial data
python manage.py create_test_data

# Collect static files
python manage.py collectstatic --noinput
```

### **6. Gunicorn Setup**

```bash
# Install Gunicorn
pip install gunicorn

# Create Gunicorn service file
sudo nano /etc/systemd/system/peykan-gunicorn.service
```

**Gunicorn Service Configuration:**
```ini
[Unit]
Description=Peykan Tourism Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/peykan-tourism/backend
Environment="PATH=/opt/peykan-tourism/venv/bin"
ExecStart=/opt/peykan-tourism/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/opt/peykan-tourism/backend/peykan.sock peykan.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start and enable Gunicorn
sudo systemctl start peykan-gunicorn
sudo systemctl enable peykan-gunicorn
```

### **7. Nginx Configuration**

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/peykan-tourism
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Backend API
    location /api/ {
        proxy_pass http://unix:/opt/peykan-tourism/backend/peykan.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Admin Interface
    location /admin/ {
        proxy_pass http://unix:/opt/peykan-tourism/backend/peykan.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Files
    location /static/ {
        alias /opt/peykan-tourism/backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media Files
    location /media/ {
        alias /opt/peykan-tourism/backend/media/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Frontend (if serving from same server)
    location / {
        root /opt/peykan-tourism/frontend/.next;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/peykan-tourism /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **8. SSL Certificate (Let's Encrypt)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **9. Celery Setup (Background Tasks)**

```bash
# Create Celery service file
sudo nano /etc/systemd/system/peykan-celery.service
```

**Celery Service Configuration:**
```ini
[Unit]
Description=Peykan Tourism Celery Worker
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
EnvironmentFile=/opt/peykan-tourism/backend/peykan/.env
WorkingDirectory=/opt/peykan-tourism/backend
ExecStart=/bin/sh -c '${WorkingDirectory}/venv/bin/celery multi start worker1 \
  -A peykan --pidfile=${WorkingDirectory}/celery/%n.pid \
  --logfile=${WorkingDirectory}/celery/%n%I.log --loglevel=INFO'
ExecStop=/bin/sh -c '${WorkingDirectory}/venv/bin/celery multi stopwait worker1 \
  --pidfile=${WorkingDirectory}/celery/%n.pid'
ExecReload=/bin/sh -c '${WorkingDirectory}/venv/bin/celery multi restart worker1 \
  -A peykan --pidfile=${WorkingDirectory}/celery/%n.pid \
  --logfile=${WorkingDirectory}/celery/%n%I.log --loglevel=INFO'

[Install]
WantedBy=multi-user.target
```

```bash
# Create Celery directories
sudo mkdir -p /opt/peykan-tourism/backend/celery
sudo chown www-data:www-data /opt/peykan-tourism/backend/celery

# Start Celery
sudo systemctl start peykan-celery
sudo systemctl enable peykan-celery
```

### **10. Monitoring Setup**

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Set up log rotation
sudo nano /etc/logrotate.d/peykan-tourism
```

**Log Rotation Configuration:**
```
/opt/peykan-tourism/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload peykan-gunicorn
    endscript
}
```

## 🔒 **Security Configuration**

### **1. Firewall Setup**

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **2. Database Security**

```bash
# Configure PostgreSQL security
sudo nano /etc/postgresql/13/main/pg_hba.conf

# Add/modify:
# local   all             postgres                                peer
# local   all             all                                     md5
# host    all             all             127.0.0.1/32            md5
# host    all             all             ::1/128                 md5

sudo systemctl restart postgresql
```

### **3. Application Security**

```bash
# Set proper permissions
sudo chown -R www-data:www-data /opt/peykan-tourism
sudo chmod -R 755 /opt/peykan-tourism
sudo chmod 600 /opt/peykan-tourism/backend/peykan/.env
```

## 📊 **Performance Optimization**

### **1. Database Optimization**

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_reservation_status_date ON reservations(status, created_at);
CREATE INDEX CONCURRENTLY idx_reservation_customer_email ON reservations(customer_email);
CREATE INDEX CONCURRENTLY idx_reservation_item_product ON reservation_items(product_type, product_id);
```

### **2. Redis Configuration**

```bash
# Optimize Redis
sudo nano /etc/redis/redis.conf

# Add/modify:
# maxmemory 256mb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000

sudo systemctl restart redis
```

### **3. Nginx Optimization**

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## 🔄 **Deployment Process**

### **1. Automated Deployment Script**

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r backend/requirements.txt

# Run migrations
cd backend
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart services
sudo systemctl restart peykan-gunicorn
sudo systemctl restart peykan-celery
sudo systemctl reload nginx

echo "Deployment completed successfully!"
```

### **2. CI/CD Pipeline (GitHub Actions)**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.4
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /opt/peykan-tourism
            ./deploy.sh
```

## 📈 **Monitoring & Maintenance**

### **1. Health Checks**

```bash
# Create health check script
nano /opt/peykan-tourism/health_check.sh
```

```bash
#!/bin/bash
# Health check endpoints
curl -f http://localhost/api/v1/health/ || exit 1
curl -f http://localhost/admin/ || exit 1
```

### **2. Backup Strategy**

```bash
# Database backup script
nano /opt/peykan-tourism/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump peykan_tourism > $BACKUP_DIR/db_backup_$DATE.sql

# Media files backup
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz /opt/peykan-tourism/backend/media/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### **3. Log Monitoring**

```bash
# Set up log monitoring
sudo apt install -y fail2ban

# Configure fail2ban
sudo nano /etc/fail2ban/jail.local
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **502 Bad Gateway**
   - Check Gunicorn service status
   - Verify socket file permissions
   - Check application logs

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check connection settings
   - Verify user permissions

3. **Static Files Not Loading**
   - Run collectstatic
   - Check Nginx configuration
   - Verify file permissions

### **Useful Commands**

```bash
# Check service status
sudo systemctl status peykan-gunicorn
sudo systemctl status peykan-celery
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis

# View logs
sudo journalctl -u peykan-gunicorn -f
sudo journalctl -u peykan-celery -f
sudo tail -f /var/log/nginx/error.log

# Database operations
sudo -u postgres psql -d peykan_tourism
python manage.py dbshell

# Performance monitoring
htop
iotop
nethogs
```

## 📞 **Support**

For deployment support and issues:
- Check application logs
- Review system resources
- Contact development team
- Refer to troubleshooting section

---

**Note**: This guide assumes a single-server deployment. For high-availability setups, consider using load balancers, multiple application servers, and database replication. 