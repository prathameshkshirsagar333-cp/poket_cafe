import { Router } from "express";
import { getProducts, getStatus, getUserCount } from "../controllers/systemController.js";

const router = Router();

router.get("/status", getStatus);
router.get("/users/count", getUserCount);
router.get("/products", getProducts);

export default router;
