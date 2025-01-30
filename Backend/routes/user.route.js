import express from "express";
import { getUserProfile, login, logout, resetPassword, signup, updateUserProfile } from "../controllers/user.controller.js";
import { authUser } from "../middlewear/isAuth.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// reset password
router.post("/reset-password", authUser, resetPassword);

//get user profile
router.get("/profile", authUser, getUserProfile);
//update user profile
router.put('/update-profile', authUser, upload.single('profilePicture'), updateUserProfile);
//logout
router.post("/logout", authUser, logout);



export default router;