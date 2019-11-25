/*
    aws-amplify uses a colon (":") in the creation of the s3 key prefix
    in the Storage.vault class. As far as I've been able to tell, colons
    are rejected by the startSpeechSynthesisTask() when used as part of
    theOutputS3KeyPrefix - whether you URI encode them or not. (sigh)
*/

import AWS from "aws-sdk";
var async = require('async');

var s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export function main(event, context) {

    const bucket = event.Records[0].s3.bucket.name;
    const tmpMp3Key = decodeURI(event.Records[0].s3.object.key);
    var finalMp3Key = null;

    async.waterfall([
        function getFinalMp3Destination(next) {
            console.log('************** getFinalMp3Destination Function Called *****************');
            console.log('fromSrcKey ==> ' + tmpMp3Key);
            var response = dynamoDb.get( {
                TableName: process.env.tmpMp3Tablename,
                 Key: {
                    srcKey: tmpMp3Key
                }
            },next);
            console.log('*********** finished getFinalMp3Destination', response);
        },
        function copyTmpMp3ToFinalDestination(response, next) {
            finalMp3Key = response.Item.destKey;
            console.log('************** copyTmpMp3ToFinalDestination Function Called *****************');
            console.log(response);

            s3.copyObject({
                CopySource: encodeURI(bucket + "/" + tmpMp3Key),
                Bucket: bucket,
                Key: finalMp3Key
            },next);
        },
        function removeTmpMp3File(response, next) {
            console.log('************** removeTmpMp3File Function Called *****************');
            s3.deleteObject({
                Bucket: bucket,
                Key: tmpMp3Key
            },next);
        },
        function removeFinalMp3DestinationReminder(response, next) {
            console.log('************** removeFinalMp3DestinationReminder Function Called *****************');
            dynamoDb.delete({
                TableName: process.env.tmpMp3Tablename,
                 Key: {
                    srcKey: tmpMp3Key
                }
            },next);
        }
    ], function (err) {
        if (err) {
            console.error(
                'Unable to copy ' + bucket + '/' + tmpMp3Key +
                ' due to an error: ' + JSON.stringify(err)
            );
        } else {
            console.log(
                'Successfully copied ' + bucket + '/' + tmpMp3Key
            );
        }
    });
}