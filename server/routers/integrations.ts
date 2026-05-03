/**
 * Integrations router — Lume
 * Endpoints para gerenciar integrações de terceiros (Twilio, SendGrid, etc)
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { encryptData, decryptData } from "../encryption";

export const integrationsRouter = router({
  /**
   * Add a new integration for the user
   */
  add: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["twilio", "sendgrid", "stripe", "openai"]),
        credentials: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Encrypt credentials before storing
        const encryptedCredentials = encryptData(JSON.stringify(input.credentials));

        // Save to database
        const result = await db.addUserIntegration(
          ctx.user.id,
          input.provider,
          input.provider, // Use provider as name
          encryptedCredentials
        );

        return {
          success: true,
          integrationId: result,
          message: `${input.provider} integration added successfully`,
        };
      } catch (error) {
        console.error("[Integrations Add Error]", error);
        throw new Error("Failed to add integration");
      }
    }),

  /**
   * Get all integrations for the user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const integrations = await db.getUserIntegrations(ctx.user.id);

      return integrations.map((i) => ({
        id: i.id,
        provider: i.provider,
        name: i.name,
        isActive: i.isActive,
        lastUsed: i.lastUsed,
        createdAt: i.createdAt,
      }));
    } catch (error) {
      console.error("[Integrations List Error]", error);
      throw new Error("Failed to list integrations");
    }
  }),

  /**
   * Get a specific integration with decrypted credentials
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const integration = await db.getUserIntegrationById(
          ctx.user.id,
          input.id
        );

        if (!integration) {
          throw new Error("Integration not found");
        }

        // Decrypt credentials
        const credentials = JSON.parse(decryptData(integration.credentials));

        return {
          id: integration.id,
          provider: integration.provider,
          name: integration.name,
          credentials,
          isActive: integration.isActive,
        };
      } catch (error) {
        console.error("[Integrations Get Error]", error);
        throw new Error("Failed to get integration");
      }
    }),

  /**
   * Update an integration
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        credentials: z.record(z.string(), z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const integration = await db.getUserIntegrationById(
          ctx.user.id,
          input.id
        );

        if (!integration) {
          throw new Error("Integration not found");
        }

        // Prepare update data
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.credentials) {
          updateData.credentials = encryptData(JSON.stringify(input.credentials));
        }

        await db.updateUserIntegration(input.id, updateData);

        return {
          success: true,
          message: "Integration updated successfully",
        };
      } catch (error) {
        console.error("[Integrations Update Error]", error);
        throw new Error("Failed to update integration");
      }
    }),

  /**
   * Delete an integration
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const integration = await db.getUserIntegrationById(
          ctx.user.id,
          input.id
        );

        if (!integration) {
          throw new Error("Integration not found");
        }

        await db.deleteUserIntegration(input.id);

        return {
          success: true,
          message: "Integration deleted successfully",
        };
      } catch (error) {
        console.error("[Integrations Delete Error]", error);
        throw new Error("Failed to delete integration");
      }
    }),
});
