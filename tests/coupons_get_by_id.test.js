const { handler } = require("../src/coupons_get_by_id");
const sampleEvent = require("../events/coupons_get_by_id_event.json");

describe("coupons_get_by_id Lambda", () => {
  test("returns 200 and coupon matching identifier when found", async () => {
    const mockItem = {
      id: "cpn-101",
      provider_id: "prov-nike",
      campaign_id: "camp-summer-2026",
      title: "50% Off Summer Sale",
      discount: "50%"
    };

    const mockDocClient = {
      send: jest.fn().mockResolvedValue({ Item: mockItem })
    };

    const response = await handler(sampleEvent, null, mockDocClient);

    expect(response.statusCode).toBe(200);
    expect(response.headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(response.body);
    expect(body.id).toBe("cpn-101");
    expect(body.provider_id).toBe("prov-nike");
    expect(body.campaign_id).toBe("camp-summer-2026");
  });

  test("returns 404 when coupon does not exist", async () => {
    const mockDocClient = {
      send: jest.fn().mockResolvedValue({})
    };

    const response = await handler(sampleEvent, null, mockDocClient);

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.message).toContain("not found");
  });

  test("returns 400 when 'id' path parameter is missing", async () => {
    const invalidEvent = {
      ...sampleEvent,
      pathParameters: {}
    };

    const response = await handler(invalidEvent);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.message).toContain("Missing path parameter 'id'");
  });

  test("returns 500 when database client throws an error", async () => {
    const mockDocClient = {
      send: jest.fn().mockRejectedValue(new Error("DynamoDB connection timeout"))
    };

    const response = await handler(sampleEvent, null, mockDocClient);

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.message).toContain("Internal server error");
  });
});
