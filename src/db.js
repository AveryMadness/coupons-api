const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

function getDocClient(clientOverride) {
  // Only use clientOverride if it's a test mock with a send() method.
  // In AWS Lambda runtime, the 3rd argument passed to handler is 'callback' function,
  // which does not have .send!
  if (clientOverride && typeof clientOverride.send === "function") {
    return clientOverride;
  }

  // LocalStack sets AWS_ENDPOINT_URL or LOCALSTACK_HOSTNAME in Lambda environment
  const endpoint =
    process.env.DYNAMODB_ENDPOINT ||
    process.env.AWS_ENDPOINT_URL ||
    (process.env.LOCALSTACK_HOSTNAME
      ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566`
      : undefined);

  const client = new DynamoDBClient({
    region: process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || "us-east-1",
    ...(endpoint && { endpoint })
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true
    }
  });
}

module.exports = { getDocClient };
