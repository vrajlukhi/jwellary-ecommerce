import express, { urlencoded } from "express"
import cookie from "cookie-parser"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"
import userRoutes from "./routes/user.route.js"
dotenv.config()
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json())
app.use(urlencoded({extended:true}))
app.use(cookie())

app.get("/",(req,res)=>{
    res.json("Hello world")
})

app.use("/api/users", userRoutes);

app.listen(process.env.PORT,()=>{
    console.log(`Port listen on  ${process.env.PORT}`);
    connectDB()
})