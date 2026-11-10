const express = require ("express")
const userController  = require("../controllers/user.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

router.get("/me",authMiddleware.authToken,userController.getMe)

module.exports = router