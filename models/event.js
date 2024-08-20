const Joi = require("joi");
const { Schema, model } = require("mongoose");

const { handleSaveErrors } = require("../helpers");

const eventSchema = new Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    photos: {
      type: Array,
    },
  },

  { minimize: false }
);

eventSchema.post("save", handleSaveErrors);

const Event = model("event", eventSchema);

const addEventSchema = Joi.object({
  subject: Joi.string().required(),
  description: Joi.string().required(),
  date: Joi.string().required(),
  files: Joi.any().meta({ index: true }).optional(),
});

const editEventSchema = Joi.object({
  subject: Joi.string().required(),
  description: Joi.string().required(),
  date: Joi.string().required(),
  files: Joi.any().meta({ index: true }).optional(),
  id: Joi.string().required(),
});

const eventsData = Joi.object({
  date: Joi.string().required(),
});

const schemasEvent = {
  addEventSchema,
  eventsData,
  editEventSchema,
};

module.exports = {
  Event,
  schemasEvent,
};
