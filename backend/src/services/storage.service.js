const ImageKit = require("@imagekit/nodejs");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const uploadFile = async (file, fileName) => {
  const result = await imagekit.files.upload({
    file: file.toString("base64"),
    fileName: fileName,
  });

  return result;
};

module.exports = {
  uploadFile,
};