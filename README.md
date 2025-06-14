# 🚀 DevMetrics

DevMetrics is a GitHub-powered productivity tracker that helps developers monitor their daily coding progress, set commit goals, visualize contribution stats, and stay consistent with smart insights — all in a clean, intuitive dashboard.


### 🔗 Live URLs

- **Frontend**: [https://dev-metrics-five.vercel.app](https://dev-metrics-five.vercel.app)
- **Backend**: [https://devmetrics-api.onrender.com](https://devmetrics-api.onrender.com)

---

## 🔐 Login

- Click **"Login with GitHub"** on the homepage.
- Auth flow is powered by **GitHub OAuth2**.
- On successful login, you're redirected to your dashboard.

---

## 📊 Features

- 🔐 **GitHub OAuth Login**
- 📈 **7-Day Commit History** (Bar Chart)
- 🎯 **Set Daily Commit Goals**
- ✅ **Goal Progress Tracker**
- 🧠 **Smart Suggestions** based on performance
- 🌱 **Consistency Score** & 🔥 **Contribution Streak Tracker**
- 🧮 **Productivity Score** out of 100
- 📬 **Weekly Pull Request Goal Tracking**
- 🍪 Cookie-based Auth (Secure, HttpOnly)

---

## 🧰 Tech Stack

| Frontend            | Backend                |
|---------------------|------------------------|
| React (Vite)        | Node.js + Express      |
| Tailwind CSS        | MongoDB (Mongoose)     |
| Recharts.js         | GitHub REST API        |
| React Router        | JWT, Cookies, Rate Limiting |

---

## ⚙️ Environment Variables

For local development, you must set the following in your `.env`:

### 🔐 Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_PERSONAL_TOKEN=your_github_token
JWT_SECRET=your_jwt_secret
