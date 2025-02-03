import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    fullName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, default: "admin" },
    number: { type: Number, unique: true },
    profilePicture: {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" }
    },
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
