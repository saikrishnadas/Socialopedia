import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register User
export const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation
        } = req.body;

        const salt = await bcrypt.genSalt();
        const hasedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hasedPassword,
            picturePath,
            friends,
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 10000),
            impressions: Math.floor(Math.random() * 10000),
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Login User
export const login = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ msg: "User does not exists" })

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Password" })

        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        // Saving refreshToken with current user
        user.refreshToken = refreshToken;
        const savedUser = await user.save();
        // Create a new user object without the password property
        const userWithoutPassword = { ...savedUser.toObject(), password: undefined };

        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); //sending refresh token via res.json is risky as it can be accessed by javasciprt, but using cookie with http only, its better in security. 
        res.status(200).json({ accessToken, user: userWithoutPassword })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}