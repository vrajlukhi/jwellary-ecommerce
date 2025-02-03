import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { uploadToCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.model.js";

//admin signup
export const adminSignup = async (req, res) => {
    try {

        const { fullName, email, number, password, confirmPassword } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !confirmPassword || !number) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if admin already exists
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Check if admin number already exists
        const adminNumber = await Admin.findOne({ number });
        if (adminNumber) {
            return res.status(400).json({ message: "Admin number already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin with hashed password
        const newAdmin = new Admin({
            fullName,
            email,
            number,
            password: hashedPassword,
        });

        // Save admin to database
        await newAdmin.save();

        res.status(201).json({
            admin: newAdmin,
            message: "Admin created successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

//admin login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Admin not found" });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Password is incorrect" });
        }

        // Generate JWT token
        const adminToken = jwt.sign(
            {
                adminId: admin._id,
                role: admin.role
            },
            process.env.ADMIN_SECRET,
            { expiresIn: '1d' }
        );
        // Set cookies
        res.cookie('adminToken', adminToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie('role', admin.role, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            admin: admin,
            message: "Login successful",
            adminToken: adminToken
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

//admin reset password
export const resetPassword = async (req, res) => {
    try {
        const { adminId } = req.admin;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        // Get admin from database
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Verify old password
        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, admin.password);
        if (!isOldPasswordCorrect) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in database
        admin.password = hashedPassword;
        await admin.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const adminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.adminId);
        res.status(200).json({ admin: admin });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

//update admin profile
export const updateAdminProfile = async (req, res) => {
    try {
        const { adminId } = req.admin;
        const { fullName, email, number } = req.body;

        let updateData = { fullName, email, number };

        // Handle profile picture upload if a file is provided
        if (req.file) {
            try {
                // Get current user to check for existing profile picture
                const currentAdmin = await Admin.findById(adminId);

                // Delete old profile picture if it exists
                if (currentAdmin.profilePicture?.public_id) {
                    await deleteFromCloudinary(currentAdmin.profilePicture.public_id);
                }

                // Upload new profile picture
                const uploadResult = await uploadToCloudinary(req.file, 'profile_pictures');

                // Add profile picture data to update object
                updateData.profilePicture = {
                    public_id: uploadResult.public_id,
                    url: uploadResult.url
                };
            } catch (uploadError) {
                return res.status(400).json({
                    message: "Error processing profile picture",
                    error: uploadError.message
                });
            }
        }

        // Update user in database
        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            updateData,
            { new: true }
        );

        res.status(200).json({
            admin: updatedAdmin,
            message: "Admin profile updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

//get all admins
export const allAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json({ admins: admins });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

//admin can get all users
export const allUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users: users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

//admin can update user
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, password } = req.body;

        let updateData = { fullName, email };

        // If password is provided, hash it and add to updateData
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateData.password = hashedPassword;
        }

        // Handle profile picture upload if a file is provided
        if (req.file) {
            try {
                // Get current user to check for existing profile picture
                const currentUser = await User.findById(userId);

                // Delete old profile picture if it exists
                if (currentUser.profilePicture?.public_id) {
                    await deleteFromCloudinary(currentUser.profilePicture.public_id);
                }

                // Upload new profile picture
                const uploadResult = await uploadToCloudinary(req.file, 'profile_pictures');

                // Add profile picture data to update object
                updateData.profilePicture = {
                    public_id: uploadResult.public_id,
                    url: uploadResult.url
                };
            } catch (uploadError) {
                return res.status(400).json({
                    message: "Error processing profile picture",
                    error: uploadError.message
                });
            }
        }

        // Update user in database
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            user: user,
            message: "User profile updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

//admin can delete user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

