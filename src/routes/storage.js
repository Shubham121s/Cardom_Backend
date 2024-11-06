const express = require("express");

const { getUploadUrl } = require("../storage/storage");
const router = express.Router();

router.route("/getUrl").post(getUploadUrl);
module.exports = router;
