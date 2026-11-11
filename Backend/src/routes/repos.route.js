const express = require("express")

const authMiddleware = require("../middleware/auth.middleware")
const repoController = require("../controllers/repos.controller")


const router = express.Router();

router.get("/repos",authMiddleware.authToken,repoController.getRepoFromDB)
router.get("/repos/sync",authMiddleware.authToken,repoController.getRepoFromGithub)

module.exports = router