const axios = require('axios');

exports.redirectToGitHub = (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=repo,user&prompt=select_account`;
    res.redirect(url); // Forces account selection
};

exports.handleCallback = async (req, res) => {
    const { code } = req.query;
    try {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, { headers: { Accept: 'application/json' } });

        req.session.githubToken = response.data.access_token;

        // Fetch user info to confirm which account was picked
        const user = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${req.session.githubToken}` }
        });
        req.session.user = user.data;

        res.redirect(`${process.env.FRONTEND_URL}/repository-selection`);
    } catch (err) {
        res.status(500).json({ error: "Auth failed" });
    }
};