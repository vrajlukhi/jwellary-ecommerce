import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

export const signup = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with hashed password
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({
            user: newUser,
            message: "User created successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        // Set cookies
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie('role', user.role, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            user: user,
            message: "Login successful",
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.clearCookie('role');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { userId } = req.user;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        // Get user from database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify old password
        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordCorrect) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in database
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findById(userId);

        res.status(200).json({
            user: user,
            message: "User profile fetched successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.user;
        const { fullName, email } = req.body;
        
        let updateData = { fullName, email };

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

        res.status(200).json({
            user: user,
            message: "User profile updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};