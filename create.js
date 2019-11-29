import uuid from "uuid";
import { success, failure } from "./libs/response-lib";
var AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      docId: uuid.v1(),
      content: data.content,
      attachment: data.attachment,
      audio: data.attachment.substr(0, data.attachment.lastIndexOf(".")) + ".mp3",
      createdAt: Date.now()
    }
  };
  console.log(event);
  try {
    await dynamoDb.put(params).promise();
    return success(params.Item);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}