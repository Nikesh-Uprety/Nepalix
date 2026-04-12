import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

type HealthResponse = {
  status: "ok";
};

router.get("/healthz", (_req: Request, res: Response<HealthResponse>) => {
  const data: HealthResponse = { status: "ok" };
  res.json(data);
});

export default router;
