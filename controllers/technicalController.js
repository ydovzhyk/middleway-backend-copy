const fs = require("fs");
const { Appointment } = require("../models/appointment");
const { Event } = require("../models/event");
const { Review } = require("../models/review");
const { QA } = require("../models/qa");

const {
  sendMail,
  sendSMS,
  updatePhoto,
  deletePhoto,
  generateAvatar,
} = require("../helpers");

const addAppointment = async (req, res, next) => {
  const { phone, parentName, childrenName, question, fromPage } = req.body;
  try {
    const newAppointment = await Appointment.create({
      phone,
      parentName,
      childrenName,
      question: question ? question : "",
      fromPage: fromPage ? fromPage : "",
    });

    let text = `Добрий день,`;
    text += `<br><br>користувач ${newAppointment.parentName} записався на зустріч з вами на рахунок його дитини ${newAppointment.childrenName}. Телефон для зв'язку: ${newAppointment.phone}.`;
    if (question) {
      text += `<br><br>Також, користувач ${newAppointment.parentName} залишив запитання: ${newAppointment.question}.`;
    }
    text += `<br><br>Переглянути увесь список користувачів записаних на зустріч, ви можете на сторінці "Зустрічі" адміністративного режиму сайту <a href="https://middleway.in.ua">посилання</a>.`;

    let textSMS = `Добрий день,`;
    textSMS += " ";
    textSMS += `користувач ${newAppointment.parentName} записався на зустріч з вами на рахунок його дитини ${newAppointment.childrenName}. Телефон для зв'язку: ${newAppointment.phone}.`;
    if (question) {
      textSMS += " ";
      textSMS += `Також, користувач ${newAppointment.parentName} залишив запитання: ${newAppointment.question}.`;
    }
    textSMS += " ";
    textSMS += ` Переглянути увесь список користувачів записаних на зустріч, ви можете на сторінці "Зустрічі" адміністративного режиму сайту https://middleway.in.ua`;

    const resultMail = await sendMail(text);
    const resultSMS = await sendSMS(textSMS);

    if (resultMail && resultSMS && newAppointment) {
      res.status(201).send({
        message:
          "Дякуємо за звернення! Ваша заявка відправлена, ми зв’яжемося з вами найближчим часом.",
      });
    } else {
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message:
        "Виникла помилка відправлення заявки, спробуйте інший спосіб зв'язатися з нами.",
    });
    return;
  }
};

const getAppointmentsList = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 10;
  try {
    const totalAppointments = await Appointment.countDocuments();

    const appointments = await Appointment.find()
      .sort({ dateCreated: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      appointments,
      totalPages: Math.ceil(totalAppointments / perPage),
    });
  } catch (erroer) {
    res.status(400).send({
      message:
        "Виникла помилка отримання інформації про зустрічі, спробуйте пізніше.",
    });
    return;
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    await Appointment.deleteOne({ _id: appointmentId });

    res.status(200).send({
      message: "Зустріч успішно видалена.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка видалення зустрічі, спробуйте пізніше.",
    });
  }
};

const editAppointment = async (req, res, next) => {
  try {
    const { id, comment, commentAuthor } = req.body;

    let currentAppointment = await Appointment.findById(id);

    if (!currentAppointment) {
      res.status(404).send({
        message: "Такої зустрічі у базі не знайдено",
      });
    } else {
      currentAppointment.addComment = comment;
      currentAppointment.addCommentAuthor = commentAuthor;
      await currentAppointment.save();
    }

    res.status(201).send({
      message: "Коментар успішно додано.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка додавання коментаря, спробуйте пізніше.",
    });
    return;
  }
};

const addEvent = async (req, res, next) => {
  try {
    const { subject, description, date } = req.body;
    const photos = req.files;
    let newEvent = null;

    if (photos?.length > 0) {
      photos.sort((a, b) => a.originalname.localeCompare(b.originalname));
      const photoURLs = await Promise.all(
        photos.map(async (photo) => {
          const tempUpload = await updatePhoto(photo);

          const img = fs.readFileSync(tempUpload, "base64");
          const final_img = {
            contentType: photo.mimetype,
            image: Buffer.from(img, "base64"),
          };
          return (
            "data:image/png;base64," +
            Buffer.from(final_img.image).toString("base64")
          );
        })
      );

      newEvent = await Event.create({
        subject,
        description,
        date,
        photos: photoURLs,
      });

      await Promise.all(
        photos.map(async (photo) => {
          deletePhoto(photo.path);
        })
      );
    } else {
      newEvent = await Event.create({
        subject,
        description,
        date,
        photos: [],
      });
    }

    if (!newEvent) {
      throw new Error("Виникла помилка створення події, спробуйте пізніше.");
    } else {
      res.status(201).send({
        message: "Ваша подія успішно створена.",
      });
    }
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка створення події, спробуйте пізніше.",
    });
    return;
  }
};

const editEvent = async (req, res, next) => {
  try {
    const { id, subject, description, date } = req.body;

    let currentEvent = await Event.findById(id);

    if (!currentEvent) {
      res.status(404).send({
        message: "Такої події у базі не знайдено",
      });
    }

    const photos = req.files;

    if (photos?.length > 0) {
      photos.sort((a, b) => a.originalname.localeCompare(b.originalname));
      const photoURLs = await Promise.all(
        photos.map(async (photo) => {
          const tempUpload = await updatePhoto(photo);

          const img = fs.readFileSync(tempUpload, "base64");
          const final_img = {
            contentType: photo.mimetype,
            image: Buffer.from(img, "base64"),
          };
          return (
            "data:image/png;base64," +
            Buffer.from(final_img.image).toString("base64")
          );
        })
      );

      currentEvent.subject = subject;
      currentEvent.description = description;
      currentEvent.date = date;
      currentEvent.photos = photoURLs;

      await currentEvent.save();

      await Promise.all(
        photos.map(async (photo) => {
          deletePhoto(photo.path);
        })
      );
    } else {
      currentEvent.subject = subject;
      currentEvent.description = description;
      currentEvent.date = date;

      await currentEvent.save();
    }

    res.status(201).send({
      message: "Подія успішно відредагована.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка редагування події, спробуйте пізніше.",
    });
    return;
  }
};

const getEventsData = async (req, res, next) => {
  try {
    const { date } = req.params;
    const month = date.split(".")[1];
    let events = await Event.find({ date: { $regex: `${month}\\.` } });

    events.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split(".").map(Number);
      const [dayB, monthB, yearB] = b.date.split(".").map(Number);

      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);

      return dateA - dateB;
    });

    const eventsDates = events.map((event) => {
      const [day, month, year] = event.date.split(".");
      return new Date(year, month - 1, day);
    });

    res.status(200).send({
      events: events,
      eventsDates: eventsDates,
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка отримання подій, спробуйте пізніше.",
    });
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    await Event.deleteOne({ _id: eventId });

    res.status(200).send({
      message: "Подія успішно видалена.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка видалення подій, спробуйте пізніше.",
    });
  }
};

const addReview = async (req, res, next) => {
  const convertDate = (date) => {
    const [day, month, year] = date.split(".").map(Number);
    return new Date(year, month - 1, day);
  };

  try {
    const { nameOwnerReview, dataSource, review, date, verified } = req.body;
    let message = null;

    const photo = req.file;
    let newReview = null;

    if (photo) {
      const tempUpload = await updatePhoto(photo);

      const img = fs.readFileSync(tempUpload, "base64");
      const final_img = {
        contentType: req.file.mimetype,
        image: Buffer.from(img, "base64"),
      };

      const photoURL =
        "data:image/png;base64," +
        Buffer.from(final_img.image).toString("base64");

      newReview = await Review.create({
        nameOwnerReview,
        dataSource: dataSource ? dataSource : "",
        review,
        verified,
        date,
        dateSort: convertDate(date),
        photo: photoURL,
      });

      await deletePhoto(tempUpload);
    } else {
      const avatarDataUrl = await generateAvatar(nameOwnerReview);
      newReview = await Review.create({
        nameOwnerReview,
        dataSource: dataSource ? dataSource : "",
        review,
        verified,
        date,
        dateSort: convertDate(date),
        photo: avatarDataUrl,
      });
    }

    if (verified === "false") {
      message = "Дякуємо за відгук, він скоро з'явиться у нас на сайті.";
    } else {
      message = "Відгук успішно створено.";
    }

    if (!newReview) {
      throw new Error("Виникла помилка створення відгуку, спробуйте пізніше.");
    } else {
      res.status(201).send({
        message: message,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Виникла помилка створення відгуку, спробуйте пізніше.",
    });
    return;
  }
};

const getReviewsList = async (req, res, next) => {
  const verified = req.query.verified === "false" ? false : true;
  const display = req.query.display || "other";
  const page = parseInt(req.query.page) || 1;
  const perPage = 5;

  const query = verified ? { verified: true } : {};

  if (display === "other") {
    try {
      const totalReviews = await Review.countDocuments(query);
      // Обчислення кількості відгуків, які потрібно пропустити
      const isLastPage = page === Math.ceil(totalReviews / perPage);

      let reviews;
      if (isLastPage) {
        const startIndex = Math.max(0, totalReviews - perPage);
        reviews = await Review.find(query)
          .sort({ dateSort: -1 })
          .skip(startIndex)
          .limit(perPage);
      } else {
        reviews = await Review.find(query)
          .sort({ dateSort: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage);
      }

      res.status(200).json({
        reviews,
        totalPagesReview: Math.ceil(totalReviews / perPage),
      });
    } catch (erroer) {
      res.status(400).send({
        message:
          "Виникла помилка отримання інформації про відгуки, спробуйте пізніше.",
      });
      return;
    }
  } else {
    try {
      const totalReviews = await Review.countDocuments(query);
      const reviews = await Review.find(query).sort({ dateSort: -1 });

      res.status(200).json({
        reviews,
        totalPagesReview: totalReviews,
      });
    } catch (erroer) {
      res.status(400).send({
        message:
          "Виникла помилка отримання інформації про відгуки, спробуйте пізніше.",
      });
      return;
    }
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    await Review.deleteOne({ _id: reviewId });

    res.status(200).send({
      message: "Відгук успішно видалено.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка видалення відгуку, спробуйте пізніше.",
    });
  }
};

const editReview = async (req, res, next) => {
  try {
    const {
      nameOwnerReview,
      dataSource,
      review,
      date,
      verified,
      dateSort,
      id,
    } = req.body;

    let currentReview = await Review.findById(id);
    const prevStatus = currentReview.verified;

    if (!currentReview) {
      res.status(404).send({
        message: "Такого відгука у базі не знайдено",
      });
    }

    const photo = req.file;

    if (photo) {
      const tempUpload = await updatePhoto(photo);

      const img = fs.readFileSync(tempUpload, "base64");
      const final_img = {
        contentType: req.file.mimetype,
        image: Buffer.from(img, "base64"),
      };

      const photoURL =
        "data:image/png;base64," +
        Buffer.from(final_img.image).toString("base64");

      currentReview.nameOwnerReview = nameOwnerReview;
      currentReview.dataSource = dataSource;
      currentReview.date = date;
      currentReview.review = review;
      currentReview.verified = verified;
      currentReview.dateSort = dateSort;
      currentReview.photo = photoURL;

      await currentReview.save();

      await deletePhoto(tempUpload);
    } else {
      currentReview.nameOwnerReview = nameOwnerReview;
      currentReview.dataSource = dataSource;
      currentReview.date = date;
      currentReview.review = review;
      currentReview.verified = verified;
      currentReview.dateSort = dateSort;

      await currentReview.save();
    }

    res.status(201).send({
      message: prevStatus
        ? "Відгук успішно відредагований."
        : "Відгук успішно додано на сайт.",
    });
  } catch (error) {
    res.status(400).send({
      message:
        "Виникла помилка редагування/додавання відгуку, спробуйте пізніше.",
    });
    return;
  }
};

const addQA = async (req, res, next) => {
  try {
    const { question, answer, answerOwner } = req.body;
    let message = null;
    const newQA = await QA.create({
      question,
      answer: answer ? answer : "",
      answerOwner: answerOwner ? answerOwner : "",
    });
    if (!answer) {
      message =
        "Дякуємо за запитання, ми обов'язково опрацюємо його у майбутньому.";
    } else {
      message = "Запитання та відповідь успішно додані.";
    }
    if (!newQA) {
      throw new Error("Виникла помилка створення запису, спробуйте пізніше.");
    } else {
      res.status(201).send({
        message: message,
      });
    }
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка створення створення запису, спробуйте пізніше.",
    });
    return;
  }
};

const getListQA = async (req, res, next) => {
  try {
    const listQA = await QA.find();
    if (!listQA) {
      throw new Error("Виникла помилка створення запису, спробуйте пізніше.");
    } else {
      res.status(200).json({
        listQA,
      });
    }
  } catch (erroer) {
    res.status(400).send({
      message:
        "Виникла помилка отримання інформації про відгуки, спробуйте пізніше.",
    });
    return;
  }
};

const editQA = async (req, res, next) => {
  try {
    const { question, answer, answerOwner, id } = req.body;

    let currentQA = await QA.findById(id);
    let prevStatus = null;

    if (!currentQA) {
      res.status(404).send({
        message: "Такого запитання не знайдено у базі",
      });
    }

    if (!currentQA.answer) {
      prevStatus = false;
    } else {
      prevStatus = true;
    }

    currentQA.question = question;
    currentQA.answer = answer;
    currentQA.answerOwner = answerOwner;

    await currentQA.save();

    res.status(201).send({
      message: prevStatus
        ? "Питання та відповідь успішно відредаговані."
        : "Ваша відповідь успішно додана до питання.",
    });
  } catch (error) {
    res.status(400).send({
      message:
        "Виникла помилка редагування питання та відповіді, спробуйте пізніше.",
    });
    return;
  }
};

const deleteQA = async (req, res, next) => {
  try {
    const { qaId } = req.params;
    await QA.deleteOne({ _id: qaId });

    res.status(200).send({
      message: "Питання успішно видалено.",
    });
  } catch (error) {
    res.status(400).send({
      message: "Виникла помилка видалення питання, спробуйте пізніше.",
    });
  }
};

module.exports = {
  addAppointment,
  getAppointmentsList,
  deleteAppointment,
  editAppointment,
  addEvent,
  getEventsData,
  deleteEvent,
  editEvent,
  addReview,
  getReviewsList,
  deleteReview,
  editReview,
  addQA,
  getListQA,
  editQA,
  deleteQA,
};
