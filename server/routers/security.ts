/**
 * Security router for 2FA and encryption operations
 */

import { protectedProcedure, publicProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { z } from "zod";
import {
  enable2FAMethod,
  disable2FAMethod,
  getEnabled2FAMethods,
  verify2FACode,
  generateBackupCodes,
} from "../twoFA";

export const securityRouter = router({
  /**
   * Get enabled 2FA methods for current user
   */
  getEnabled2FAMethods: protectedProcedure.query(async ({ ctx }) => {
    try {
      const methods = await getEnabled2FAMethods(ctx.user.id);
      return {
        methods,
        success: true,
      };
    } catch (error) {
      console.error("[Get 2FA Methods Error]", error);
      return {
        methods: [],
        success: false,
        error: "Failed to get 2FA methods",
      };
    }
  }),

  /**
   * Enable 2FA method for current user
   */
  enable2FA: protectedProcedure
    .input(
      z.object({
        method: z.enum(["email", "sms", "authenticator"]),
        phoneNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await enable2FAMethod(
          ctx.user.id,
          input.method,
          input.phoneNumber
        );

        return {
          success: true,
          secret: result.secret,
          backupCodes: result.backupCodes,
          message: `2FA method '${input.method}' enabled successfully`,
        };
      } catch (error) {
        console.error("[Enable 2FA Error]", error);
        return {
          success: false,
          error: "Failed to enable 2FA",
        };
      }
    }),

  /**
   * Disable 2FA method for current user
   */
  disable2FA: protectedProcedure
    .input(
      z.object({
        method: z.enum(["email", "sms", "authenticator"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await disable2FAMethod(ctx.user.id, input.method);

        return {
          success: true,
          message: `2FA method '${input.method}' disabled successfully`,
        };
      } catch (error) {
        console.error("[Disable 2FA Error]", error);
        return {
          success: false,
          error: "Failed to disable 2FA",
        };
      }
    }),

  /**
   * Verify 2FA code
   */
  verify2FA: protectedProcedure
    .input(
      z.object({
        method: z.enum(["email", "sms", "authenticator"]),
        code: z.string().min(6).max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const isValid = await verify2FACode(ctx.user.id, input.method, input.code);

        if (isValid) {
          return {
            success: true,
            message: "2FA code verified successfully",
          };
        } else {
          return {
            success: false,
            error: "Invalid 2FA code",
          };
        }
      } catch (error) {
        console.error("[Verify 2FA Error]", error);
        return {
          success: false,
          error: "Failed to verify 2FA code",
        };
      }
    }),

  /**
   * Generate new backup codes
   */
  generateBackupCodes: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const codes = generateBackupCodes(10);

      return {
        success: true,
        backupCodes: codes,
        message: "New backup codes generated",
      };
    } catch (error) {
      console.error("[Generate Backup Codes Error]", error);
      return {
        success: false,
        error: "Failed to generate backup codes",
      };
    }
  }),
});
