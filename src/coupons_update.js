const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { getDocClient } = require("./db");

const TABLE_NAME = process.env.TABLE_NAME || "coupons";

exports.handler = async (event, context, callbackOrMock) => {
  console.log("coupons_update received event:", JSON.stringify(event));

  try {
    const id =
      event?.pathParameters?.id ||
      event?.pathParameters?.['id'] ||
      event?.queryStringParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing path parameter 'id'" })
      };
    }

    let payload = {};
    if (event.body) {
      payload = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    }

    // In AWS Lambda runtime, the 3rd argument is 'callback', not a mock client
    const mockClient =
      callbackOrMock && typeof callbackOrMock.send === "function"
        ? callbackOrMock
        : null;
    const docClient = getDocClient(mockClient);

    // Fetch existing item if any so partial update preserves attributes
    let existingItem = {};
    try {
      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { id }
        })
      );
      if (existing && existing.Item) {
        existingItem = existing.Item;
      }
    } catch (e) {
      // Continue even if get fails (e.g. initial write)
    }

    const updatedItem = {
      ...existingItem,
      ...payload,
      id,
      updated_at: new Date().toISOString()
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: updatedItem
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Coupon updated successfully",
        coupon: updatedItem
      })
    };
  } catch (error) {
    console.error("Error in coupons_update:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Internal server error updating coupon",
        error: error.message
      })
    };
  }
};
