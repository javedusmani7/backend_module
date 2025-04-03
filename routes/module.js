import express from "express";
import { createModule, createRole, deleteModule, deleteRole, getModules, getRoleByID, getRoles, updateModule, updatePermission, updateRole, getBlog, getNews, createRoleTest, updateBlog, deleteBlog, addBlog, addNews, updateNews, deleteNews } from "../controllers/moduleController.js";
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
router.get("/blog",verifyJWT, getBlog);
router.post("/blog",verifyJWT, verifyPermission, addBlog);
router.patch("/blog", verifyJWT, verifyPermission, updateBlog);
router.delete("/blog",verifyJWT, verifyPermission, deleteBlog); // Delete a blog
router.get("/news",verifyJWT, getNews);
router.post("/news", verifyJWT, verifyPermission, addNews);
router.patch("/news", verifyJWT, verifyPermission, updateNews); // Changed from PUT to PATCH
router.delete("/news", verifyJWT, verifyPermission, deleteNews);

export default router;

