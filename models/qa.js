const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const qaSchema = new Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    answer: {
      type: String,
    },
    answerOwner: {
      type: String,
    },
  },

  { minimize: false }
);

qaSchema.post("save", handleSaveErrors);

const QA = model("qa", qaSchema);

const addQASchema = Joi.object({
  question: Joi.string().required(),
  answer: Joi.string().allow("").optional(),
  answerOwner: Joi.string().allow("").optional(),
});

const editQASchema = Joi.object({
  id: Joi.string().required(),
  question: Joi.string().allow("").required(),
  answer: Joi.string().allow("").required(),
  answerOwner: Joi.string().required(),
});

const schemasQA = {
  addQASchema,
  editQASchema,
};

module.exports = {
  QA,
  schemasQA,
};
