const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { getDocClient } = require("./db");

const TABLE_NAME = process.env.TABLE_NAME || "coupons";

exports.handler = async (event, context, callbackOrMock) => {
  console.log("coupons_get_by_id received event:", JSON.stringify(event));

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

    // In AWS Lambda runtime, the 3rd argument is 'callback', not a mock client
    const mockClient =
      callbackOrMock && typeof callbackOrMock.send === "function"
        ? callbackOrMock
        : null;
    const docClient = getDocClient(mockClient);

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id }
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Coupon with id '${id}' not found` })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error("Error in coupons_get_by_id:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Internal server error retrieving coupon",
        error: error.message
      })
    };
  }
};
