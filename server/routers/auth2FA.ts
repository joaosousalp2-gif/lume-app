/**
 * Auth 2FA router — Lume
 * Endpoints para gerenciar 2FA no fluxo de autenticação
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { verify2FACode } from "../twoFA";

export const auth2FARouter = router({
  /**
   * Verify 2FA code and mark user as 2FA verified
   */
  verify: protectedProcedure
    .input(
      z.object({
        code: z.string().min(6).max(20),
        method: z.enum(["email", "sms", "authenticator"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the code
        const isValid = await verify2FACode(ctx.user.id, input.method, input.code);

        if (!isValid) {
          return {
            success: false,
            error: "Invalid 2FA code",
          };
        }

        // Mark user as 2FA verified in database
        await db.updateUserTwoFAStatus(ctx.user.id, true);

        return {
          success: true,
          message: "2FA verification successful",
          isValid: true,
          verified: true,
        };
      } catch (error) {
        console.error("[Auth 2FA Verify Error]", error);
        return {
          success: false,
          error: "Failed to verify 2FA code",
        };
      }
    }),

  /**
   * Get 2FA status for current user
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get user from database
      const user = await db.getUserByOpenId(String(ctx.user.id));

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: true,
        twoFARequired: user.twoFARequired,
        twoFAVerified: user.twoFAVerified,
      };
    } catch (error) {
      console.error("[Auth 2FA Status Error]", error);
      return {
        success: false,
        error: "Failed to get 2FA status",
      };
    }
  }),

  /**
   * Disable 2FA for current user
   */
  disable: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Disable 2FA
      await db.updateUserTwoFAStatus(ctx.user.id, false);

      return {
        success: true,
        message: "2FA disabled successfully",
      };
    } catch (error) {
      console.error("[Auth 2FA Disable Error]", error);
      return {
        success: false,
        error: "Failed to disable 2FA",
      };
    }
  }),

  /**
   * Skip 2FA verification (only for testing/demo)
   */
  skip: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // In production, this should be removed or require admin privileges
      console.warn("[Auth 2FA Skip] User skipped 2FA verification", ctx.user.id);

      return {
        success: true,
        message: "2FA verification skipped",
      };
    } catch (error) {
      console.error("[Auth 2FA Skip Error]", error);
      return {
        success: false,
        error: "Failed to skip 2FA",
      };
    }
  }),
});
