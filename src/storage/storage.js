const aws = require("aws-sdk");

const s3 = new aws.S3({
  endpoint: process.env.R2_S3_API_URL,
  accessKeyId: process.env.R2_API_KEY_ID,
  secretAccessKey: process.env.R2_API_ACCESS_TOKEN,
  signatureVersion: "v4",
});

const getUploadUrl = async (req, res, next) => {
  try {
    let key;
    let fileName;
    const { type } = req.query;
    if (type === "logo") {
      fileName = generateUniqueFilename("jpg");
      key = `logo/${generateUniqueFilename("jpg")}`;
      console.log("====================================");
      console.log(key);
      console.log("====================================");
    } else if (type === "profile") {
      fileName = generateUniqueFilename("jpg");
      key = `profiles/${generateUniqueFilename("jpg")}`;
    } else if (type === "cars") {
      fileName = generateUniqueFilename("jpg");
      key = `cars/${generateUniqueFilename("jpg")}`;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid image type" });
    }
    const url = await s3.getSignedUrlPromise("putObject", {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Expires: 36000,
      ContentType: "application/octet-stream",
    });
    res.status(200).json({
      success: true,
      uploadUrl: url,
      key: key,
      file: fileName,
    });
  } catch (e) {
    res.status(401).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

function generateUniqueFilename(extension) {
  return `${Date.now()}_${Math.random()}.${extension}`;
}

const deleteFile = async (fileKey) => {
  const s3 = new aws.S3({
    endpoint: process.env.R2_S3_API_URL,
    accessKeyId: process.env.R2_API_KEY_ID,
    secretAccessKey: process.env.R2_API_ACCESS_TOKEN,
    signatureVersion: "v4",
  });

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileKey,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.error(`Error deleting file ${fileKey} from S3: ${err}`);
    } else {
      console.log(`File deleted successfully: ${fileKey}`);
    }
  });
};

const getFile = async (req, res, next) => {
  const { type, imageKey } = req.params;
  console.log("====================================");
  console.log(imageKey);
  console.log("====================================");

  let imagePath;

  if (type === "logo") {
    imagePath = `logo/${imageKey}`;
    // Handle the retrieval of product images from S3
  } else if (type === "profiles") {
    imagePath = `profiles/${imageKey}`;
    // Handle the retrieval of profile pictures from S3
  } else {
    return res.status(400).json({ error: "Invalid image type" });
  }
  try {
    const image = await s3
      .getObject({
        Bucket: process.env.BUCKET_NAME,
        Key: imagePath,
      })
      .promise();

    if (image.Body) {
      res.setHeader("Content-Type", "image/jpeg");
      res.send(image.Body);
    } else {
      res.status(404).json({ error: "Image not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve the image" });
  }
};

module.exports = {
  getUploadUrl,
  deleteFile,
  getFile,
};
