/**
 * 2FA Middleware — Lume
 * Middleware para verificar se usuário completou 2FA antes de acessar recursos protegidos
 */

import type { Request, Response, NextFunction } from "express";
import * as db from "../db";

/**
 * Middleware que verifica se o usuário completou 2FA
 * Se não completou, redireciona para página de 2FA
 */
export async function require2FA(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get user from session (assumes auth middleware already ran)
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get user from database
    const user = await db.getUserByOpenId(userId);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Check if 2FA is required and not verified
    if (user.twoFARequired && !user.twoFAVerified) {
      res.status(403).json({
        error: "2FA verification required",
        requiresAuth: true,
        userId: user.id,
      });
      return;
    }

    // User passed 2FA check, continue
    next();
  } catch (error) {
    console.error("[2FA Middleware] Error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Middleware que permite acesso apenas se 2FA não foi verificado
 * Usado para a página de verificação de 2FA
 */
export async function require2FANotVerified(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await db.getUserByOpenId(userId);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Allow access only if 2FA is required but not verified
    if (user.twoFARequired && !user.twoFAVerified) {
      next();
      return;
    }

    // User already verified or 2FA not required
    res.status(403).json({ error: "2FA already verified or not required" });
  } catch (error) {
    console.error("[2FA Not Verified Middleware] Error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
