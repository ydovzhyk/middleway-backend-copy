const express = require("express");
const { ctrlWrapper } = require("../../helpers");
const ctrl = require("../../controllers/technicalController");

const {
  validateBody,
  isValidId,
  authorize,
  upload,
  uploadFiles,
} = require("../../middlewares");
const { schemas } = require("../../models/appointment");
const { schemasEvent } = require("../../models/event");
const { schemasReview } = require("../../models/review");
const { schemasQA } = require("../../models/qa");
const router = express.Router();

// *Add appointment
router.post(
  "/appointment",
  validateBody(schemas.addAppointmentSchema),
  ctrlWrapper(ctrl.addAppointment)
);

// *Get appointmens
router.get("/appointments", ctrlWrapper(ctrl.getAppointmentsList));

// *Delete appointment
router.delete(
  "/appointment/delete/:appointmentId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteAppointment)
);

router.post(
  "/appointment/edit",
  authorize,
  validateBody(schemas.editAppointmentSchema),
  ctrlWrapper(ctrl.editAppointment)
);

// *Add event
router.post(
  "/event",
  authorize,
  uploadFiles.array("files"),
  validateBody(schemasEvent.addEventSchema),
  ctrlWrapper(ctrl.addEvent)
);

// *Get events dates and data
router.get("/events/:date", ctrlWrapper(ctrl.getEventsData));

// *Delete event
router.delete(
  "/event/delete/:eventId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteEvent)
);

// *Edit event
router.post(
  "/event/edit",
  authorize,
  uploadFiles.array("files"),
  validateBody(schemasEvent.editEventSchema),
  ctrlWrapper(ctrl.editEvent)
);

// *Add review
router.post(
  "/review",
  authorize,
  upload.single("photo"),
  ctrlWrapper(ctrl.addReview)
);

// *Edit review
router.post(
  "/review/edit",
  authorize,
  upload.single("photo"),
  validateBody(schemasReview.editReviewSchema),
  ctrlWrapper(ctrl.editReview)
);

// *Get Reviews
router.get("/reviews", ctrlWrapper(ctrl.getReviewsList));

// *Delete review
router.delete(
  "/review/delete/:reviewId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteReview)
);

// *Add QA
router.post(
  "/qa",
  validateBody(schemasQA.addQASchema),
  ctrlWrapper(ctrl.addQA)
);

// *Edit QA
router.post(
  "/qa/edit",
  authorize,
  validateBody(schemasQA.editQASchema),
  ctrlWrapper(ctrl.editQA)
);

// *Get QA List
router.get("/listQA", ctrlWrapper(ctrl.getListQA));

// *Delete QA
router.delete(
  "/qa/delete/:qaId",
  authorize,
  isValidId,
  ctrlWrapper(ctrl.deleteQA)
);

module.exports = router;
