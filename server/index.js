import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./controllers/auth.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import refreshRoutes from "./routes/refresh.js";
import logoutRoutes from "./routes/logout.js";
import { verifyToken } from "./middleware/auth.js";
import { createPost } from "./controllers/posts.js";
import cookieParser from "cookie-parser";
import { credentials } from "./middleware/credentials.js";
import { corsOptions } from "./config/corsOptions.js"
import { connectDB } from "./config/dbConn.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 6001;

// Connect to MongoDB
connectDB();

// CONFIGURATIONS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"))
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);
app.use(cors(corsOptions));
app.use(cookieParser())
app.use("/assets", express.static(path.join(__dirname, "public/assets")))

// FILE STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage })

// ROUTES WITH FILES
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);


// ROUTES
app.use('/refresh', refreshRoutes);
app.use('/logout', logoutRoutes);
app.use("/auth", authRoutes)
app.use("/users", userRoutes);
app.use("/posts", postRoutes);


mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server connected to PORT ${PORT}`))
});