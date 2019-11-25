/*
    function convertPdf(bucket,key) {
        var tmpFilename = "/tmp/" + uuid.v1();
        s3_get(bucket, key, tmpFilename);
        try {
            //const pdf = new pdftotext(tmpFilename);
            //const data = pdf.getTextSync(); // returns buffer
            //console.log(data.toString('utf8'));
            tmpFilename = "/tmp/" + uuid.v1();
            //fs.writeFileSync(tmpFilename, data);
            //s3_put(tmpFilename, bucket, key + ".txt");
        } catch(e) {
            console.log(e);
        }
        pdf.pdfToText(tmpFilename, function(err, data) {
            if (err) {
                throw(err);
            } else {
            }
        });
}
*/

// dependencies
var async = require('async');
var AWS = require('aws-sdk');

const outputS3KeyPrefix = "tmpMp3/";
const s3 = new AWS.S3();
const polly = new AWS.Polly();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {

    console.log("Reading options from event:\n", JSON.stringify(event));
    var bucketName = event.Records[0].s3.bucket.name;
    var txtKey = decodeURIComponent(event.Records[0].s3.object.key).replace(/\+/gi,' ');

    // Sigh. There's a mismatch between what is acceptable in the AWS Amplify
    // code and what is acceptable in aws-sdk.
    //var regex = /:/gi;
    //var outputPrefix = srcKey.replace(regex,"_");

    // Execute the async functions serailly using a single try catch.
    async.waterfall([

        function getTxtFromFile(next) {
            s3.getObject({
                    Bucket: bucketName,
                    Key: txtKey
                }, next);
        },
        function startTextToSpeechProcess(response, next) {
              polly.startSpeechSynthesisTask( {
                OutputFormat: 'mp3',
                OutputS3BucketName: bucketName,
                Text: response.Body.toString('utf-8'),
                VoiceId: 'Joanna',
                //Engine: 'standard', // | neural,
                LanguageCode: 'en-US',
                OutputS3KeyPrefix: outputS3KeyPrefix,
                TextType: 'text'
              }, next);
        },
        // Add record to mp3FinlenameMapping table { startSpeechSynthesisTask-key, destination-key}
        function saveFinalMp3Destination(response, next) {
            console.log('************** _copy Function Called *****************');
            console.log("output URI" + response.SynthesisTask.OutputUri);

            var tmpMp3Key = response.SynthesisTask.OutputUri.split(bucketName + "/")[1];
            var finalMp3Key = txtKey.split(".txt")[0] + ".mp3";

            console.log("tmpMp3Key" + tmpMp3Key + "\n" +
                "finalMp3Key = " + finalMp3Key + "\n" +
                "bucket = " + bucketName);

            dynamoDb.put({
                TableName: process.env.tmpMp3Tablename,
                Item: {
                srcKey: tmpMp3Key,
                destKey: finalMp3Key
                }
            }, next);
        }
    ], function (err) {
        if (err) {
            console.error(
                'Unable to convert ' + bucketName + '/' + txtKey +
                ' due to an error: ' + JSON.stringify(err)
            );
        } else {
            console.log(
                'Successfully converted ' + bucketName + '/' + txtKey
            );
        }
    });
};

