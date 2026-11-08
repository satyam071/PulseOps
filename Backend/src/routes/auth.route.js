const express = require("express")
const authController = require("../controllers/auth.controller")


const router = express.Router();


router.get("/github",authController.github)
router.get("/github/callback",authController.githubCallback)


module.exports = router