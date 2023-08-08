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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        // Create a new user object without the password property
        const userWithoutPassword = { ...user.toObject(), password: undefined };
        res.status(200).json({ token, user: userWithoutPassword })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}