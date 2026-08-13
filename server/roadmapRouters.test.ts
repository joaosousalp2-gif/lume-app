import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("roadmap integrations", () => {
  it("registers the protected roadmap routers", () => {
    expect(appRouter._def.procedures).toHaveProperty("security.getFraudAlerts");
    expect(appRouter._def.procedures).toHaveProperty("security.getTrustedContacts");
    expect(appRouter._def.procedures).toHaveProperty("security.updatePreferences");
    expect(appRouter._def.procedures).toHaveProperty("financialInsights.get");
    expect(appRouter._def.procedures).toHaveProperty("financialInsights.simulate");
    expect(appRouter._def.procedures).toHaveProperty("documentVault.list");
    expect(appRouter._def.procedures).toHaveProperty("documentVault.upload");
    expect(appRouter._def.procedures).toHaveProperty("privacy.exportData");
    expect(appRouter._def.procedures).toHaveProperty("privacy.requestDeletion");
    expect(appRouter._def.procedures).toHaveProperty("health.status");
  });
});
