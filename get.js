import { success, failure } from "./libs/response-lib";
var AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      docId: event.pathParameters.id
    }
  };

  try {
    const result = await dynamoDb.get(params).promise();
    if (result.Item) {
      // Return the retrieved item
      return success(result.Item);
    } else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}