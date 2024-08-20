const { isValidObjectId } = require("mongoose");
const { RequestError } = require("../helpers");

const isValidId = (req, res, next) => {
  const qaId = req.params.qaId || req.body.qaId;
  const eventId = req.params.eventId || req.body.eventId;
  const reviewId = req.params.reviewId || req.body.reviewId;
  const userId = req.params.userId || req.body.userId;
  const appointmentId = req.params.appointmentId || req.body.appointmentId;

  try {
    const objectId = eventId || userId || appointmentId || reviewId || qaId;
    if (!isValidObjectId(objectId)) {
      throw new Error("is not a valid ObjectId");
    }
    next();
  } catch (error) {
    next(RequestError(400, error.message));
  }
};

module.exports = isValidId;
