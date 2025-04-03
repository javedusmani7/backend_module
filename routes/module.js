import express from "express";
import { createModule, createRole, deleteModule, deleteRole, getModules, getRoleByID, getRoles, updateModule, updatePermission, updateRole, getBlog, getNews, createRoleTest, updateBlog, deleteBlog, addBlog } from "../controllers/moduleController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { verifyAdmin, verifyJWT, verifyLevel, verifyPermission } from "../middlewares/auth.js";

const router = express.Router();
router.use(apiLimiter);


router.post("/module", verifyJWT, createModule);
router.put("/module", verifyJWT, verifyPermission, updateModule);
router.delete("/module", verifyJWT, verifyPermission, deleteModule);
router.post("/getModule", verifyJWT, getModules);
router.post("/createRole",verifyJWT, verifyLevel, createRole);
// router.post("/createRoleTest", createRoleTest);
router.post("/deleteRole", verifyJWT, verifyPermission, deleteRole);
router.post("/getRole",verifyJWT, getRoles);
router.put("/updateRole", verifyJWT, verifyPermission, updateRole);
router.put("/role/permission", verifyJWT, verifyPermission, updatePermission);
router.post("/rolebyid", verifyJWT, getRoleByID);
router.get("/blog", getBlog);
router.post("/blog", addBlog);
router.put("/blog", updateBlog); // Update a blog
router.delete("/blog", deleteBlog); // Delete a blog
router.post("/news", getNews);
export default router;

