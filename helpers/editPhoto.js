const fs = require("fs/promises");
const sharp = require("sharp");

const updatePhoto = async (photo) => {
  const { path: tempUpload } = photo;

  const resizedImage = await sharp(tempUpload)
    .resize({ width: 700, height: 600, fit: "inside" })
    .toBuffer();

  sharp.cache(false);

  await fs.writeFile(tempUpload, resizedImage);

  return tempUpload;
};

const deletePhoto = async (file) => {
  await fs.unlink(file, (err) => {
    if (err) throw err;
  });
};

module.exports = { updatePhoto, deletePhoto };
