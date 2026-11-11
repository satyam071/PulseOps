const axios = require("axios");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { decrypt } = require("../utils/crypto");
const Repo = require("../models/repo.model");

const getRepoFromDB = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({ message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id); // use the key you signed with

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const filter = { userId: user._id };

    const [repos, total] = await Promise.all([
      Repo.find(filter)
        .sort({ pushedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Repo.countDocuments(filter),
    ]);

    console.log("user:", user._id.toString());
    console.log("db:", Repo.db.name, "| collection:", Repo.collection.name);
    console.log(
      "count for this user:",
      await Repo.countDocuments({ userId: user._id }),
    );

    return res.status(200).json({
      message: "Repositories fetched successfully",
      repos,
      page,
      total,
      pages: Math.ceil(total / limit),
      lastReposSyncAt: user.lastReposSyncAt ?? null,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Failed to load repos" });
  }
};

const getRepoFromGithub = async (req, res) => {
  try {
    const token = req.cookies.token;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    if (!token) {
      return res.status(400).json({ message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id); // use the key you signed with

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const gitToken = decrypt(user.githubToken);

    //Getting the synced data from github
    const { data } = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${gitToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
      },
    });

    const repos = await Promise.all(
      data.map((r) =>
        Repo.findOneAndUpdate(
          { userId: user._id, githubId: r.id },
          {
            $set: {
              name: r.name,
              fullName: r.full_name,
              owner: r.owner.login,
              htmlUrl: r.html_url,
              private: r.private,
              description: r.description,
              language: r.language,
              stars: r.stargazers_count,
              openIssues: r.open_issues_count,
              pushedAt: r.pushed_at,
              fork: r.fork,
              archived: r.archived,
              defaultBranch: r.default_branch,
            },
          },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
        ),
      ),
    );

    const filter = { userId: user._id };

    const [repo, total] = await Promise.all([
      Repo.find(filter)
        .sort({ pushedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Repo.countDocuments(filter),
    ]);

    console.log("user:", user._id.toString());
    console.log("db:", Repo.db.name, "| collection:", Repo.collection.name);
    console.log(
      "count for this user:",
      await Repo.countDocuments({ userId: user._id }),
    );

    return res.status(200).json({
      message: "Repositories fetched successfully",
      repo,
      page,
      total,
      pages: Math.ceil(total / limit),
      lastReposSyncAt: user.lastReposSyncAt ?? null,
    });

    // return res.status(200).json({
    //   message: "User Successfully fetched",
    //   data,
    // });
  } catch (err) {
    return res.status(400).json({
      message: "Error Occured",
      error: err.message, // sending the full err object gives you that messy output
    });
  }
};

module.exports = { getRepoFromDB, getRepoFromGithub };
