// src/models/repo.model.js
const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    // link to your user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // identity
    githubId: { type: Number, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true }, // "owner/repo", needed for detail-page calls
    owner: String,                              // owner.login (shows collaborator repos)
    htmlUrl: String,                            // "open on GitHub" link

    // shown on the dashboard card
    private: { type: Boolean, default: false },
    description: { type: String, default: null },
    language: { type: String, default: null },
    stars: { type: Number, default: 0 },
    openIssues: { type: Number, default: 0 },
    pushedAt: Date,                             // "last pushed", also used for sorting

    // for filtering and the detail page
    fork: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    defaultBranch: String,

    // your own field
    tracked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// one row per user per repo, so sync never creates duplicates
repoSchema.index({ userId: 1, githubId: 1 }, { unique: true });

// fast "newest push first" listing on the dashboard
repoSchema.index({ userId: 1, pushedAt: -1 });

module.exports = mongoose.model("Repo", repoSchema);