import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Handle Refresh Token
export const handleRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(401);
        // console.log(cookies.jwt)

        const refreshToken = cookies.jwt;

        //find user with refresh token
        const foundUser = await User.findOne({ refreshToken }).exec();

        if (!foundUser) return res.sendStatus(403); //forbidden

        //evalvate jwt
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err || foundUser.id !== decoded.id) return res.sendStatus(403);
            const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
            res.json({ accessToken })
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}