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
import {
  createTrustedContact,
  deleteTrustedContact,
  getTrustedContactsByUserId,
  getUserPreferences,
  upsertUserPreferences,
  getLaunchesByUserId,
} from "../db";
import { detectSuspiciousTransactions } from "../fraudDetection";

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
  getFraudAlerts: protectedProcedure.query(async ({ ctx }) => {
    const launches = await getLaunchesByUserId(ctx.user.id);
    return detectSuspiciousTransactions(launches);
  }),

  getTrustedContacts: protectedProcedure.query(({ ctx }) => getTrustedContactsByUserId(ctx.user.id)),

  addTrustedContact: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(128),
      relationship: z.string().min(1).max(64),
      phone: z.string().min(6).max(32),
      email: z.string().email().optional(),
      notifyFraud: z.boolean().default(true),
      notifySuspicious: z.boolean().default(true),
    }))
    .mutation(({ ctx, input }) => createTrustedContact({ userId: ctx.user.id, ...input })),

  removeTrustedContact: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => deleteTrustedContact(ctx.user.id, input.id).then(() => ({ success: true }))),

  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await getUserPreferences(ctx.user.id);
    return preferences ?? {
      userId: ctx.user.id,
      simplifiedMode: false,
      voiceProfile: "pt-BR-natural",
      voiceSpeed: "1.0",
      emailNotifications: true,
      smsNotifications: false,
    };
  }),

  updatePreferences: protectedProcedure
    .input(z.object({
      simplifiedMode: z.boolean().optional(),
      voiceProfile: z.string().min(1).max(32).optional(),
      voiceSpeed: z.string().regex(/^([0-9]+)(\\.[0-9]+)?$/).optional(),
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
    }))
    .mutation(({ ctx, input }) => upsertUserPreferences(ctx.user.id, input)),

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
