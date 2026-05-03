/**
 * tRPC router for webhook management
 * Handles CRUD operations for user webhooks
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

const webhookEventTypes = [
  "fraud_detected",
  "budget_limit_exceeded",
  "large_transaction",
  "unusual_activity",
  "security_alert",
  "recommendation_available",
] as const;

const notificationMethods = ["sms", "email"] as const;

export const webhooksRouter = router({
  /**
   * Create a new webhook
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        eventType: z.enum(webhookEventTypes),
        notificationMethod: z.enum(notificationMethods),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const webhook = await db.createUserWebhook({
          userId: ctx.user.id,
          name: input.name,
          eventType: input.eventType,
          notificationMethod: input.notificationMethod,
          isActive: true,
        });

        return {
          success: true,
          webhookId: webhook.id,
          webhook,
        };
      } catch (error) {
        console.error("[Webhooks] Error creating webhook:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create webhook",
        });
      }
    }),

  /**
   * Get all webhooks for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const webhooks = await db.getUserWebhooks(ctx.user.id);
      return webhooks;
    } catch (error) {
      console.error("[Webhooks] Error listing webhooks:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list webhooks",
      });
    }
  }),

  /**
   * Get a specific webhook
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const webhook = await db.getUserWebhook(input.id, ctx.user.id);

        if (!webhook) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Webhook not found",
          });
        }

        return webhook;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Webhooks] Error getting webhook:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get webhook",
        });
      }
    }),

  /**
   * Update a webhook
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        eventType: z.enum(webhookEventTypes).optional(),
        notificationMethod: z.enum(notificationMethods).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify webhook belongs to user
        const webhook = await db.getUserWebhook(input.id, ctx.user.id);
        if (!webhook) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Webhook not found",
          });
        }

        await db.updateUserWebhook(input.id, {
          name: input.name,
          eventType: input.eventType,
          notificationMethod: input.notificationMethod,
          isActive: input.isActive,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Webhooks] Error updating webhook:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update webhook",
        });
      }
    }),

  /**
   * Delete a webhook
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify webhook belongs to user
        const webhook = await db.getUserWebhook(input.id, ctx.user.id);
        if (!webhook) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Webhook not found",
          });
        }

        await db.deleteUserWebhook(input.id);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Webhooks] Error deleting webhook:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete webhook",
        });
      }
    }),

  /**
   * Get webhook events for a specific webhook
   */
  getEvents: protectedProcedure
    .input(z.object({ webhookId: z.number(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify webhook belongs to user
        const webhook = await db.getUserWebhook(input.webhookId, ctx.user.id);
        if (!webhook) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Webhook not found",
          });
        }

        const events = await db.getWebhookEvents(
          input.webhookId,
          input.limit
        );
        return events;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Webhooks] Error getting webhook events:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get webhook events",
        });
      }
    }),

  /**
   * Get event types available
   */
  getEventTypes: protectedProcedure.query(() => {
    return webhookEventTypes.map((type) => ({
      value: type,
      label: type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));
  }),

  /**
   * Get notification methods available
   */
  getNotificationMethods: protectedProcedure.query(() => {
    return notificationMethods.map((method) => ({
      value: method,
      label: method.charAt(0).toUpperCase() + method.slice(1),
    }));
  }),
});
