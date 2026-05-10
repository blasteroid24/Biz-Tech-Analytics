# Production Deployment Guide: BizTech Analytics

To deploy this project for high availability and low maintenance, we recommend a **Hybrid Cloud Architecture**:

- **Frontend**: [Vercel](https://vercel.com) (Best for Next.js 15)
- **Backend API**: [AWS App Runner](https://aws.amazon.com/apprunner/) (Easiest way to run the Backend Docker container)
- **Database**: [Supabase](https://supabase.com) (Managed PostgreSQL with excellent connection pooling)

---

## 1. Database Setup (Supabase)
1. Create a new project on **Supabase**.
2. Go to **Project Settings > Database** and copy the **Transaction Connection String**. 
   - *Example*: `postgresql://postgres.[ID]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
3. Since Drizzle needs to push the schema, ensure you use the **Session Mode** string for migrations and **Transaction Mode** for the app.

## 2. Backend Deployment (AWS App Runner)
AWS App Runner is superior to ECS for this use case because it handles SSL (HTTPS) and auto-scaling automatically.

1. **Push to ECR**:
   - Create a repository in **AWS ECR** (Elastic Container Registry).
   - Authenticate your local Docker: `aws ecr get-login-password --region ...`
   - Tag and push your backend image:
     ```bash
     docker build -t biztech-backend ./backend
     docker tag biztech-backend:latest [AWS_ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/biztech-backend:latest
     docker push [AWS_ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/biztech-backend:latest
     ```
2. **Create Service**:
   - In AWS App Runner, select the ECR image you just pushed.
   - Set **Environment Variables**:
     - `DATABASE_URL`: Your Supabase connection string.
     - `FRONTEND_URL`: Your Vercel URL (e.g., `https://biztech-frontend.vercel.app`).
     - `JWT_ACCESS_SECRET`: A long random string.
     - `PORT`: 5000
   - AWS will provide a URL like `https://xyz.aws-region.awsapprunner.com`. **This is your BACKEND_URL.**

## 3. Frontend Deployment (Vercel)
1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. **Environment Variables**:
   - `NEXT_PUBLIC_BACKEND`: The HTTPS URL provided by AWS App Runner.
4. Deploy. Vercel automatically provides a production-grade HTTPS URL.

---

## 🏗️ Essential Environment Changes for Production

| Variable | Local/Docker Value | Production Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...@db:5432/...` | `postgresql://postgres.[ID]...` (Supabase) |
| `FRONTEND_URL` | `http://localhost:3000` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_BACKEND` | `http://localhost:5000` | `https://xyz.awsapprunner.com` |
| `NODE_ENV` | `development` | `production` |

---

## ❓ Why this setup?
1. **No Domain? No Problem**: Both Vercel and AWS App Runner provide free **HTTPS** subdomains. You don't need to buy a domain or manage SSL certificates.
2. **Security**: Supabase handles DB backups and security patches. Vercel handles Frontend DDoS protection.
3. **Connectivity**: Since Supabase is on AWS (usually), latency between the AWS App Runner backend and Supabase is near zero.
4. **Cold Starts**: Vercel and App Runner handle traffic spikes better than a small EC2 instance.
