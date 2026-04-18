import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import demoBookingsRouter from "./demo-bookings.js";
import contactRouter from "./contact.js";
import accountRouter from "./account.js";
import plansRouter from "./plans.js";
import subscriptionsRouter from "./subscriptions.js";
import paymentsRouter from "./payments.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/demo-bookings", demoBookingsRouter);
router.use("/contact", contactRouter);
router.use("/account", accountRouter);
router.use("/plans", plansRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/payments", paymentsRouter);
router.use("/admin", adminRouter);

export default router;
