import { Response, NextFunction } from "express";
import {
  canAccessAdminPage,
  canAccessAdminPanel,
  type AdminPageKey,
} from "@workspace/db";
import type { AuthRequest } from "./auth.js";

export function requireAdminPanel(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!canAccessAdminPanel(req.user.role)) {
    res.status(403).json({ error: "Admin panel access denied" });
    return;
  }
  next();
}

export function requireAdminPage(page: AdminPageKey) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const ok = canAccessAdminPage(req.user.role, page, req.user.adminPageAccess);
    if (!ok) {
      res.status(403).json({ error: `Access to '${page}' denied`, page });
      return;
    }
    next();
  };
}
