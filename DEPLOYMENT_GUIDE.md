# Production Deployment & Operations Guide
## Al-Rawabi Travel & Tours Portal (B2C & B2B)

This guide provides end-to-end instructions for deploying your portal to live production environments.

---

### Option 1: Vercel (Fastest & Zero Configuration)
Ideal for launching the B2C customer portal immediately.

1. **Push your code to GitHub or GitLab:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete b2c/b2b travel portal"
   git branch -M main
   git remote add origin https://github.com/your-username/travel-agency-portal.git
   git push -u origin main
   ```
2. **Import into Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New Project"** -> Select your repository.
   - Framework Preset: **Next.js** (detected automatically).
   - Root Directory: `./`
3. **Environment Variables:**
   Add these in the Vercel dashboard:
   - `GEMINI_API_KEY`: *(Optional, for AI assistant features)*
   - `APP_URL`: `https://your-custom-domain.com`
4. **Click "Deploy":**
   Vercel builds and issues free SSL certificates (`https`) instantly.

---

### Option 2: Docker & Cloud Run / AWS ECS / VPS
Your repository already includes an optimized multi-stage `Dockerfile` with Next.js Standalone mode (`output: 'standalone'` in `next.config.ts`), generating a lightweight container image (< 180MB).

#### Local Container Test
```bash
# Build the image
docker build -t travel-portal:latest .

# Run the container locally on port 3000
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  travel-portal:latest
```

#### Deploy to Google Cloud Run (Fully Managed Serverless)
```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Build and push image to Google Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/travel-portal:latest

# 3. Deploy to Cloud Run (Scale to zero supported)
gcloud run deploy travel-portal \
  --image gcr.io/YOUR_PROJECT_ID/travel-portal:latest \
  --platform managed \
  --region me-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --min-instances 1 \
  --memory 1Gi \
  --set-env-vars NODE_ENV=production
```

---

### Option 3: VPS (Ubuntu / Debian on Hetzner, DigitalOcean, or AWS EC2)
For self-hosting on your own virtual machine with PM2 and Nginx reverse proxy:

1. **Install Node.js 20 & PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx
   sudo npm install -g pm2
   ```

2. **Clone & Build:**
   ```bash
   git clone https://github.com/your-username/travel-agency-portal.git /var/www/travel-portal
   cd /var/www/travel-portal
   npm ci
   npm run build
   ```

3. **Start with PM2:**
   ```bash
   pm2 start npm --name "travel-portal" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/travel-portal`):**
   ```nginx
   server {
       listen 80;
       server_name travel.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable SSL (Free Let's Encrypt Certificate):**
   ```bash
   sudo ln -s /etc/nginx/sites-available/travel-portal /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d travel.yourdomain.com
   ```

---

### Step 4: Connecting Production Travel APIs & Payment Gateways

When taking the portal live to process real customer payments:

1. **Payment Gateways (KSA & UAE):**
   - **Saudi Arabia:** Integrate **Mada**, **Apple Pay**, and **STC Pay** via **Tap Payments**, **PayTabs**, or **HyperPay**.
   - **Dubai / UAE:** Integrate **Stripe**, **Checkout.com**, or **Network International** for AED card processing.

2. **Supply & Ticketing Layer (GDS / Consolidators):**
   - Direct GDS: Connect your credentials (Amadeus Web Services, Sabre SOAP/REST, or Travelport).
   - Aggregators: Connect Duffel API, PK Wholesalers, or TBO Holidays credentials.
   - Umrah Direct Feeds: Connect direct APIs for Maqam / GDS Umrah blocks for Jed/Med flights.
