// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

const s3 = new AWS.S3();

const transforms = [
  { name: 'w_256', width: 256 },
  { name: 'w_1024', width: 1024 },
];

exports.handler = async (event, context, callback) => {
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  const key = event.Records[0].s3.object.key;
  const sanitizedKey = key.replace(/\+/g, ' ');
  const parts = sanitizedKey.split('/');
  const filename = parts[parts.length - 1];

  const dstBucket = srcBucket;

  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log('Could not determine the image type.');
    return;
  }

  const imageType = typeMatch[1].toLowerCase();
  if (imageType != 'jpg' && imageType != 'png' && imageType != 'jpeg') {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  try {
    const params = {
      Bucket: srcBucket,
      Key: srcKey,
    };
    var origimage = await s3.getObject(params).promise();
  } catch (error) {
    console.log('이미지 가져오는데 에러임');
    console.log(error);
    return;
  }
  try {
    await Promise.all(
      transforms.map(async (item) => {
        const buffer = await sharp(origimage.Body).resize({ width: item.width }).toBuffer();

        const destparams = {
          Bucket: dstBucket,
          Key: `profile/${item.name}/${filename}`,
          Body: buffer,
          ContentType: 'image',
        };

        return await s3.putObject(destparams).promise();
      }),
    );
  } catch (error) {
    console.log('이미지 올리는데 에러임');
    console.log(error);
    return;
  }

  console.log('Successfully resized');
};
