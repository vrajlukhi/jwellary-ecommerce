import express from "express";
import { isAdmin } from "../middlewear/isAuth.js";
import { adminLogin, adminProfile, adminSignup, allAdmins, allUsers, deleteUser, resetPassword, updateAdminProfile, updateUser } from "../controllers/admin.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();
//create admin 
router.post("/create-admin", isAdmin, adminSignup);
//login admin
router.post("/login-admin", adminLogin);
//reset password
router.post("/reset-password", isAdmin, resetPassword);
//get admin profile
router.get("/admin-profile", isAdmin, adminProfile);
//update admin profile
router.put("/admin-profile", isAdmin, upload.single('profilePicture'), updateAdminProfile);
//get all admins
router.get("/all-admins", isAdmin, allAdmins);
//get all users
router.get("/all-users", isAdmin, allUsers);
//update user
router.put("/update-user/:userId", isAdmin, upload.single('profilePicture'), updateUser);
//delete user
router.delete("/delete-user/:userId", isAdmin, deleteUser);




export default router;
