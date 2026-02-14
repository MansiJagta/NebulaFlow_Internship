const axios = require('axios');

exports.getRepos = async (req, res) => {
    if (!req.session.githubToken) return res.status(401).json({ error: "Not authenticated" });

    try {
        const repos = await axios.get('https://api.github.com/user/repos?sort=updated', {
            headers: { Authorization: `Bearer ${req.session.githubToken}` }
        });

        // Return both user profile and repos for the UI
        res.json({
            user: req.session.user,
            repositories: repos.data
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch repos" });
    }
};