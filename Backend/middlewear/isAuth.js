import jwt from 'jsonwebtoken';

export const authUser = async (req, res, next) => {
    try {
        // Get token from cookie
        // const token = req.cookies.token;

        // if (!token) {
        //     return res.status(401).json({ message: "Authentication required" });
        // }
        // const {Authorization} = req.headers
        // console.log("Authorization",Authorization);
        
        // if(!Authorization){
        //     return res.status(401).json({message:"You must have logged in"})
        // }
        // const token = Authorization.replace("Bearer ","")
        const authorization = req.headers.authorization; // Lowercase key
        console.log("Authorization Header: ", authorization);
        
        if (!authorization) {
            return res.status(401).json({ message: "You must be logged in" });
        }
        const token = authorization.replace("Bearer ", "");
        console.log("Extracted Token: ", token);
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