import express from "express";
import { getFeedPosts, getUserPosts, likePost, deletePost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import { ROLES_LIST } from "../config/roles_list.js";
import { verifyRoles } from "../middleware/verifyRoles.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, verifyRoles(ROLES_LIST.Editor), likePost);

/* DELETE */
router.delete("/:id", verifyToken, verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), deletePost);

export default router;