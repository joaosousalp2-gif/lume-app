import { describe, expect, it } from "vitest";

describe("Pluggy credentials", () => {
  it("authenticates against the Pluggy API without exposing the token", async () => {
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;
    expect(clientId, "PLUGGY_CLIENT_ID must be configured").toBeTruthy();
    expect(clientSecret, "PLUGGY_CLIENT_SECRET must be configured").toBeTruthy();

    const response = await fetch("https://api.pluggy.ai/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    expect(response.ok, `Pluggy auth returned HTTP ${response.status}`).toBe(true);
    const body = await response.json() as { apiKey?: string };
    expect(body.apiKey).toBeTruthy();
  }, 20_000);
});
