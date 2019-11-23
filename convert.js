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

var s3 = new AWS.S3();
var polly = new AWS.Polly();

exports.handler = function(event, context, callback) {

    console.log("Reading options from event:\n", JSON.stringify(event));
    var srcBucket = event.Records[0].s3.bucket.name;
    var srcKey = decodeURIComponent(event.Records[0].s3.object.key);

    // Sigh. There's a mismatch between what is acceptable in the AWS Amplify
    // code and what is acceptable in aws-sdk.
    var regex = /:/gi;
    var outputPrefix = srcKey.replace(regex,"_");

    // Execute the async functions serailly using a single try catch.
    async.waterfall([

        function download(next) {
            s3.getObject({
                    Bucket: srcBucket,
                    Key: srcKey
                }, next);
        },
        function convertTextToSpeech(response, next) {
              polly.startSpeechSynthesisTask( {
                OutputFormat: 'mp3',
                OutputS3BucketName: srcBucket,
                Text: response.Body.toString('utf-8'),
                VoiceId: 'Joanna',
                //Engine: 'standard', // | neural,
                LanguageCode: 'en-US',
                OutputS3KeyPrefix: outputPrefix,
                TextType: 'text'
              }, next);
        }
    ], function (err) {
        if (err) {
            console.error(
                'Unable to convert ' + srcBucket + '/' + srcKey +
                'to ' + srcBucket + '/' + outputPrefix + '\n' +
                ' due to an error: ' + JSON.stringify(err)
            );
        } else {
            console.log(
                'Successfully converted ' + srcBucket + '/' + srcKey +
                'to ' + srcBucket + '/' + outputPrefix
            );
        }
    });
};

