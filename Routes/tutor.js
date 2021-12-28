import express from "express"
import { becomeTutor, currentInstructor, getAccountStatus } from "../Controllers/tutor"
import { requireLogin } from "../middlewares"
const router = express.Router()


router.post('/become-tutor', requireLogin, becomeTutor)
router.post('/get-account-status', requireLogin, getAccountStatus)
router.get("/current-tutor", requireLogin,  currentInstructor);

module.exports = router