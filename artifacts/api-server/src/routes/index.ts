import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import demoBookingsRouter from "./demo-bookings.js";
import contactRouter from "./contact.js";
import accountRouter from "./account.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/demo-bookings", demoBookingsRouter);
router.use("/contact", contactRouter);
router.use("/account", accountRouter);

export default router;
