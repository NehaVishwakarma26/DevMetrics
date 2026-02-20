const axios = require("axios");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const { fetchAndSaveGithubStats } = require("./githubDataController");


// ==============================
// 🔐 GITHUB LOGIN
// ==============================
const githubLogin = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  // const redirectUri = "http://localhost:5000/api/github/callback";
    const redirectUri="https://devmetrics-api.onrender.com/api/github/callback";
  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo read:user`;

  res.redirect(githubAuthUrl);
};


// ==============================
// 🔁 GITHUB CALLBACK
// ==============================
const githubCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ message: "No code found in callback URL" });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
                    redirect_uri:"https://devmetrics-api.onrender.com/api/github/callback"
        // redirect_uri: "http://localhost:5000/api/github/callback",
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get GitHub user profile
    const userResponse = await axios.get(
      "https://api.github.com/user",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const githubUser = userResponse.data;

    let user = await User.findOne({ githubId: githubUser.id });

    if (!user) {
      user = await User.create({
        username: githubUser.login,
        githubId: githubUser.id,
        avatar: githubUser.avatar_url,
        accessToken,
      });
    } else {
      user.accessToken = accessToken;
      await user.save();
    }

    // Trigger incremental sync (non-blocking)
    fetchAndSaveGithubStats(user).catch((err) =>
      console.error("Initial sync failed:", err.message)
    );

    // Create JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    console.log("Redirecting to dashboard...");
res.redirect("https://dev-metrics-five.vercel.app/dashboard");

  } catch (err) {
    console.error("GitHub OAuth error:", err.message);
    res.status(500).json({ message: "GitHub authentication failed" });
  }
};
    // res.redirect("http://localhost:5173/dashboard");


// ==============================
// 🚪 LOGOUT
// ==============================
const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    path: "/",
  });

  res.status(200).json({ msg: "Logged out successfully" });
};


// ==============================
// 🔄 MANUAL SYNC (FIXED)
// ==============================
const syncGithubStats = async (req, res) => {
  try {
    // ALWAYS fetch full user from DB
    const fullUser = await User.findById(req.user.id);

    if (!fullUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await fetchAndSaveGithubStats(fullUser);

    res.status(200).json({
      success: true,
      message: "Incremental sync completed",
    });
  } catch (err) {
    console.error("Manual sync error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to sync stats.",
    });
  }
};


module.exports = {
  githubCallback,
  githubLogin,
  logout,
  syncGithubStats,
};