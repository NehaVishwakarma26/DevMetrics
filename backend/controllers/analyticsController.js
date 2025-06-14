const axios = require("axios");

const getUserAnalytics = async (req, res) => {
  try {
    const user = req.user; // from JWT, contains id + username

    const response = await axios.get(
      `https://api.github.com/users/${user.username}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_PERSONAL_TOKEN}`,
        },
      }
    );

    const {
      public_repos,
      followers,
      following,
      created_at,
      avatar_url,
      bio,
      location,
      html_url,
    } = response.data;

    res.status(200).json({
      username: user.username,
      public_repos,
      followers,
      following,
      created_at,
      avatar_url,
      bio,
      location,
      profile: html_url,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: err.message });
  }
};

module.exports = { getUserAnalytics };