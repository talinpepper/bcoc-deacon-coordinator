# BCoC Youth Ministry Deacon Coordinator Portal

A full-stack web application and conversational intake bot for **Talin Pepper** (Youth Ministry Deacon Coordinator) to gather, track, and summarize quarterly reporting updates from Youth Ministers (Mason Hill & Dylan Holland), the Deacon Coordinator, and 8 Youth Deacons prior to elders presentations for Elders Carter Mahanay & Scott Barkley.

Features **Google Gemini AI** for dynamic follow-up survey questions and AI-polished executive presentation summaries with grammar and syntax cleanup.

---

## 🚀 GitHub & Render Deployment Guide (24/7 Free Hosting)

Follow these simple steps to make your app available 24/7 on the internet so your team can access it anytime from their mobile phones:

### Step 1: Upload Your Code to GitHub

1. Go to [GitHub.com](https://github.com) and log into your account (or create a free account).
2. Click the **"+"** icon in the top right -> **New repository**.
3. Name your repository **`bcoc-deacon-coordinator`**.
4. Leave it as **Public** (or **Private**), do NOT initialize with a README, and click **Create repository**.
5. In your local terminal / command prompt inside `c:\Antigravity Projects\BCoC Deacon Coordinator`, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - BCoC Deacon Coordinator with Gemini AI"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/bcoc-deacon-coordinator.git
   git push -u origin main
   ```
   *(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username)*

---

### Step 2: Deploy Free 24/7 on Render.com

1. Go to [Render.com](https://render.com) and create a free account (or log in with GitHub).
2. On your Render Dashboard, click **New +** (top right) -> **Web Service**.
3. Select **Build and deploy from a Git repository** -> Click **Next**.
4. Connect your GitHub account and select your **`bcoc-deacon-coordinator`** repository.
5. Render will automatically detect the settings from `render.yaml`:
   - **Name**: `bcoc-deacon-coordinator`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.js`
6. Under **Environment Variables**:
   - Add Key: `GEMINI_API_KEY`
   - Value: *(Paste your Gemini API key from your local `.env` file)*
7. Click **Create Web Service**.

---

### 🎉 Your Live URL
Render will deploy your app in ~2 minutes and provide a public URL like:
`https://bcoc-deacon-coordinator.onrender.com`

- You can open this link on your phone.
- The **"1-Click SMS"** buttons on your Coordinator Dashboard will text this live link directly to Mason, Dylan, and your deacons!
