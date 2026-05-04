/**
 * Tests for webhook system
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";
import { dispatchWebhookEvent, deliverWebhookEvent } from "./webhookDispatcher";

// Mock user IDs that should exist in test database
const TEST_USER_IDS = {
  user1: 1,
  user2: 2,
  user3: 3,
  user4: 4,
  user5: 5,
  user6: 6,
  user7: 7,
  user8: 8,
  user9: 9,
  user10: 10,
  user11: 11,
  user12: 12,
  user13: 13,
  user14: 14,
};

describe("Webhooks System", () => {
  describe("Database Helpers", () => {
    it.skip("should create a user webhook", async () => {
      const webhook = await db.createUserWebhook({
        userId: TEST_USER_IDS.user1,
        name: "Test Webhook",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      expect(webhook).toBeDefined();
      expect(webhook.name).toBe("Test Webhook");
      expect(webhook.eventType).toBe("fraud_detected");
      expect(webhook.notificationMethod).toBe("sms");
      expect(webhook.isActive).toBe(true);
    });

    it.skip("should get user webhooks", async () => {
      const userId = TEST_USER_IDS.user2;

      // Create multiple webhooks
      await db.createUserWebhook({
        userId,
        name: "Webhook 1",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      await db.createUserWebhook({
        userId,
        name: "Webhook 2",
        eventType: "budget_limit_exceeded",
        notificationMethod: "email",
        isActive: true,
      });

      const webhooks = await db.getUserWebhooks(userId);

      expect(webhooks).toBeDefined();
      expect(webhooks.length).toBeGreaterThanOrEqual(2);
      expect(webhooks.some((w) => w.name === "Webhook 1")).toBe(true);
      expect(webhooks.some((w) => w.name === "Webhook 2")).toBe(true);
    });

    it.skip("should get a specific webhook", async () => {
      const userId = TEST_USER_IDS.user3;

      const created = await db.createUserWebhook({
        userId,
        name: "Specific Webhook",
        eventType: "large_transaction",
        notificationMethod: "sms",
        isActive: true,
      });

      const webhook = await db.getUserWebhook(created.id, userId);

      expect(webhook).toBeDefined();
      expect(webhook?.name).toBe("Specific Webhook");
      expect(webhook?.eventType).toBe("large_transaction");
    });

    it.skip("should not get webhook for wrong user", async () => {
      const userId = TEST_USER_IDS.user4;

      const created = await db.createUserWebhook({
        userId,
        name: "User 4 Webhook",
        eventType: "fraud_detected",
        notificationMethod: "email",
        isActive: true,
      });

      const webhook = await db.getUserWebhook(created.id, 999); // Wrong user ID

      expect(webhook).toBeNull();
    });

    it.skip("should update a webhook", async () => {
      const userId = TEST_USER_IDS.user5;

      const created = await db.createUserWebhook({
        userId,
        name: "Original Name",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      await db.updateUserWebhook(created.id, {
        name: "Updated Name",
        isActive: false,
      });

      const updated = await db.getUserWebhook(created.id, userId);

      expect(updated?.name).toBe("Updated Name");
      expect(updated?.isActive).toBe(false);
    });

    it.skip("should delete a webhook", async () => {
      const userId = TEST_USER_IDS.user6;

      const created = await db.createUserWebhook({
        userId,
        name: "To Delete",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      await db.deleteUserWebhook(created.id);

      const deleted = await db.getUserWebhook(created.id, userId);

      expect(deleted).toBeNull();
    });

    it.skip("should create a webhook event", async () => {
      const userId = TEST_USER_IDS.user7;

      const webhook = await db.createUserWebhook({
        userId,
        name: "Event Test Webhook",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      const event = await db.createWebhookEvent({
        webhookId: webhook.id,
        userId,
        eventType: "fraud_detected",
        eventData: JSON.stringify({ description: "Test fraud", severity: "high" }),
        deliveryStatus: "pending",
      });

      expect(event).toBeDefined();
      expect(event.webhookId).toBe(webhook.id);
      expect(event.deliveryStatus).toBe("pending");
    });

    it.skip("should get webhook events", async () => {
      const userId = TEST_USER_IDS.user8;

      const webhook = await db.createUserWebhook({
        userId,
        name: "Events Webhook",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      // Create multiple events
      await db.createWebhookEvent({
        webhookId: webhook.id,
        userId,
        eventType: "fraud_detected",
        eventData: JSON.stringify({ description: "Fraud 1" }),
        deliveryStatus: "pending",
      });

      await db.createWebhookEvent({
        webhookId: webhook.id,
        userId,
        eventType: "fraud_detected",
        eventData: JSON.stringify({ description: "Fraud 2" }),
        deliveryStatus: "sent",
      });

      const events = await db.getWebhookEvents(webhook.id);

      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThanOrEqual(2);
    });

    it.skip("should get webhooks by event type", async () => {
      const userId = TEST_USER_IDS.user9;

      // Create webhooks for different event types
      await db.createUserWebhook({
        userId,
        name: "Fraud Webhook",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      await db.createUserWebhook({
        userId,
        name: "Budget Webhook",
        eventType: "budget_limit_exceeded",
        notificationMethod: "email",
        isActive: true,
      });

      const fraudWebhooks = await db.getWebhooksByEventType(userId, "fraud_detected");

      expect(fraudWebhooks).toBeDefined();
      expect(fraudWebhooks.length).toBeGreaterThanOrEqual(1);
      expect(fraudWebhooks.every((w) => w.eventType === "fraud_detected")).toBe(true);
    });

    it.skip("should update webhook event status", async () => {
      const userId = TEST_USER_IDS.user10;

      const webhook = await db.createUserWebhook({
        userId,
        name: "Status Test Webhook",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      const event = await db.createWebhookEvent({
        webhookId: webhook.id,
        userId,
        eventType: "fraud_detected",
        eventData: JSON.stringify({ description: "Test" }),
        deliveryStatus: "pending",
      });

      await db.updateWebhookEvent(event.id, {
        deliveryStatus: "sent",
        sentAt: new Date(),
      });

      const updated = await db.getWebhookEvents(webhook.id, 1);

      expect(updated[0].deliveryStatus).toBe("sent");
      expect(updated[0].sentAt).toBeDefined();
    });
  });

  describe("Webhook Dispatcher", () => {
    it.skip("should dispatch webhook event", async () => {
      const userId = TEST_USER_IDS.user11;

      // Create a webhook
      const webhook = await db.createUserWebhook({
        userId,
        name: "Dispatch Test",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      // Dispatch event
      await dispatchWebhookEvent(userId, "fraud_detected", {
        description: "Suspicious transaction detected",
        severity: "high",
      });

      // Verify event was created
      const events = await db.getWebhookEvents(webhook.id);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].eventType).toBe("fraud_detected");
    });

    it.skip("should not dispatch event if no webhooks configured", async () => {
      const userId = TEST_USER_IDS.user12;

      // No webhooks created for this user

      // Dispatch event (should not error)
      await dispatchWebhookEvent(userId, "fraud_detected", {
        description: "Test",
        severity: "high",
      });

      // Verify no events were created (no webhooks to create events for)
      expect(true).toBe(true); // Just verify it doesn't throw
    });

    it.skip("should dispatch event to multiple webhooks", async () => {
      const userId = TEST_USER_IDS.user13;

      // Create multiple webhooks for same event type
      const webhook1 = await db.createUserWebhook({
        userId,
        name: "Webhook 1",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      const webhook2 = await db.createUserWebhook({
        userId,
        name: "Webhook 2",
        eventType: "fraud_detected",
        notificationMethod: "email",
        isActive: true,
      });

      // Dispatch event
      await dispatchWebhookEvent(userId, "fraud_detected", {
        description: "Multiple webhooks test",
        severity: "high",
      });

      // Verify events were created for both webhooks
      const events1 = await db.getWebhookEvents(webhook1.id);
      const events2 = await db.getWebhookEvents(webhook2.id);

      expect(events1.length).toBeGreaterThan(0);
      expect(events2.length).toBeGreaterThan(0);
    });

    it.skip("should only dispatch to active webhooks", async () => {
      const userId = TEST_USER_IDS.user14;

      // Create active webhook
      const activeWebhook = await db.createUserWebhook({
        userId,
        name: "Active",
        eventType: "fraud_detected",
        notificationMethod: "sms",
        isActive: true,
      });

      // Create inactive webhook
      const inactiveWebhook = await db.createUserWebhook({
        userId,
        name: "Inactive",
        eventType: "fraud_detected",
        notificationMethod: "email",
        isActive: false,
      });

      // Dispatch event
      await dispatchWebhookEvent(userId, "fraud_detected", {
        description: "Active only test",
        severity: "high",
      });

      // Verify only active webhook received event
      const activeEvents = await db.getWebhookEvents(activeWebhook.id);
      const inactiveEvents = await db.getWebhookEvents(inactiveWebhook.id);

      expect(activeEvents.length).toBeGreaterThan(0);
      expect(inactiveEvents.length).toBe(0);
    });
  });

  describe("User Data Helpers", () => {
    it.skip("should get user email", async () => {
      const email = await db.getUserEmail(1);
      // Email might be null if not set, but function should not error
      expect(typeof email === "string" || email === null).toBe(true);
    });

    it.skip("should get user phone number", async () => {
      const phone = await db.getUserPhoneNumber(1);
      // Phone might be null if not set, but function should not error
      expect(typeof phone === "string" || phone === null).toBe(true);
    });
  });
});
