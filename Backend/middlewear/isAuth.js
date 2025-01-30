import jwt from 'jsonwebtoken';

export const authUser = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Add user data to request object
            req.user = {
                userId: decoded.userId,
                role: decoded.role
            };

            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid token" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};