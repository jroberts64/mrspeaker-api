/*
    aws-amplify uses a colon (":") in the creation of the s3 key prefix
    in the Storage.vault class. As far as I've been able to tell, colons
    are rejected by the startSpeechSynthesisTask() when used as part of
    theOutputS3KeyPrefix - whether you URI encode them or not. (sigh)
*/

import AWS from "aws-sdk";
var async = require('async');

var s3 = new AWS.S3();


export function main(event, context) {

    var srcBucket = event.Records[0].s3.bucket.name;
    var fromSrcKey = decodeURI(event.Records[0].s3.object.key);
    var toSrcKey = fromSrcKey.replace("_", ":");
    var filename = toSrcKey.split(".txt")[0] + ".mp3";
    var copySource = srcBucket + "/" + fromSrcKey;

    async.waterfall([
        function _copy(next) {
            console.log('************** _copy Function Called *****************');
            s3.copyObject({
                CopySource: encodeURI(copySource),
                Key: filename,
                Bucket: srcBucket
            },next);
        },
        function _delete(response, next) {
            console.log('************** _delete Function Called *****************');
            s3.deleteObject({
                Key: fromSrcKey,
                Bucket: srcBucket
            },next);
        }
    ], function (err) {
        if (err) {
            console.error(
                'Unable to copy ' + srcBucket + '/' + fromSrcKey +
                'to ' + srcBucket + '/' + toSrcKey + '\n' +
                ' due to an error: ' + JSON.stringify(err)
            );
        } else {
            console.log(
                'Successfully copied ' + srcBucket + '/' + fromSrcKey +
                'to ' + srcBucket + '/' + toSrcKey
            );
        }
    });
}