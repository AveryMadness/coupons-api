exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Coupons API is working successfully"
    })
  };
};
