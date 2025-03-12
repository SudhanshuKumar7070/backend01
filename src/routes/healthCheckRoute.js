import { Router } from "express";
import { HealthCheck } from "../controllers/healthCheck.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";
const router= Router();
 router.route("/healthCheck").get(verifyJWT,HealthCheck);
 export default router;