const RequestError = require("./RequestError");
const ctrlWrapper = require("./ctrlWrapper");
const handleSaveErrors = require("./handleSaveErrors");
const sendMail = require("./sendMail");
const sendSMS = require("./sendSMS");
const generateAvatar = require("./generateAvatar");
const { updatePhoto, deletePhoto } = require("./editPhoto");

module.exports = {
  RequestError,
  ctrlWrapper,
  handleSaveErrors,
  sendMail,
  sendSMS,
  updatePhoto,
  deletePhoto,
  generateAvatar,
};
