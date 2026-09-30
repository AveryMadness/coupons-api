const { handler } = require("../src/index");
const sampleEvent = require("../events/coupons_list_event.json");

describe("coupons_list Lambda", () => {
  test("returns 200 status code for API Gateway GET event", async () => {
    const response = await handler(sampleEvent);
    expect(response.statusCode).toBe(200);
  });

  test("returns JSON content type header", async () => {
    const response = await handler(sampleEvent);
    expect(response.headers["Content-Type"]).toBe("application/json");
  });

  test("returns the expected success message", async () => {
    const response = await handler(sampleEvent);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ message: "Coupons API is working successfully" });
  });
});
