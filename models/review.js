const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const reviewSchema = new Schema(
  {
    nameOwnerReview: {
      type: String,
      required: [true, "Name is required"],
    },
    dataSource: {
      type: String,
      required: [true, "Data source is required"],
    },
    review: {
      type: String,
      required: [true, "Review is required"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    dateSort: {
      type: Date,
      required: [true, "Date for sort is required"],
    },
    photo: {
      type: String,
    },
    verified: {
      type: Boolean,
      required: [true, "Verified is required"],
    },
  },

  { minimize: false }
);

reviewSchema.post("save", handleSaveErrors);

const Review = model("review", reviewSchema);

const addReviewSchema = Joi.object({
  nameOwnerReview: Joi.string().required(),
  dataSource: Joi.string().optional(),
  review: Joi.string().required(),
  verified: Joi.boolean().required(),
  date: Joi.string().required(),
  photo: Joi.any().meta({ index: true }).optional(),
});

const editReviewSchema = Joi.object({
  nameOwnerReview: Joi.string().required(),
  dataSource: Joi.string().optional(),
  review: Joi.string().required(),
  verified: Joi.boolean().required(),
  date: Joi.string().required(),
  dateSort: Joi.date().required(),
  photo: Joi.any().meta({ index: true }).optional(),
  id: Joi.string().required(),
});

const reviewsData = Joi.object({
  date: Joi.string().required(),
});

const schemasReview = {
  addReviewSchema,
  reviewsData,
  editReviewSchema,
};

module.exports = {
  Review,
  schemasReview,
};
