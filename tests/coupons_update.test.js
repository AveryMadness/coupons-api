const { handler } = require("../src/coupons_update");
const sampleEvent = require("../events/coupons_update_event.json");

describe("coupons_update Lambda", () => {
  test("returns 200 and updates coupon attributes including provider_id and campaign_id", async () => {
    const mockDocClient = {
      send: jest.fn().mockImplementation((command) => {
        // Mock GetCommand returning existing item
        if (command.constructor && command.constructor.name === "GetCommand") {
          return Promise.resolve({
            Item: { id: "cpn-101", initialField: "value" }
          });
        }
        // Mock PutCommand
        return Promise.resolve({});
      })
    };

    const response = await handler(sampleEvent, null, mockDocClient);

    expect(response.statusCode).toBe(200);
    expect(response.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(response.body);
    expect(body.message).toBe("Coupon updated successfully");
    expect(body.coupon.id).toBe("cpn-101");
    expect(body.coupon.provider_id).toBe("prov-nike");
    expect(body.coupon.campaign_id).toBe("camp-summer-2026");
    expect(body.coupon.discount).toBe("50%");
  });

  test("handles body passed as parsed object", async () => {
    const objectBodyEvent = {
      ...sampleEvent,
      body: {
        provider_id: "prov-adidas",
        campaign_id: "camp-fall-2026",
        discount: "30%"
      }
    };

    const mockDocClient = {
      send: jest.fn().mockResolvedValue({})
    };

    const response = await handler(objectBodyEvent, null, mockDocClient);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.coupon.provider_id).toBe("prov-adidas");
    expect(body.coupon.campaign_id).toBe("camp-fall-2026");
  });

  test("returns 400 when 'id' path parameter is missing", async () => {
    const invalidEvent = {
      ...sampleEvent,
      pathParameters: null
    };

    const response = await handler(invalidEvent);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.message).toContain("Missing path parameter 'id'");
  });

  test("returns 500 when database client throws an error", async () => {
    const mockDocClient = {
      send: jest.fn().mockRejectedValue(new Error("DynamoDB write failed"))
    };

    const response = await handler(sampleEvent, null, mockDocClient);

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.message).toContain("Internal server error");
  });
});
