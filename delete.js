import { success, failure } from "./libs/response-lib";
var AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    // 'Key' defines the partition key and sort key of the item to be removed
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'docId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      docId: event.pathParameters.id
    }
  };

  try {
    await dynamoDb.delete(params).promise();
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
}