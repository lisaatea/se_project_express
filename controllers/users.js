const User = require("../models/user");
const { INVALID_DATA, NOT_FOUND, SERVER_ERROR } = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(SERVER_ERROR.code)
        .send({ message: SERVER_ERROR.message });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND.code).send({ message: NOT_FOUND.message });
      }
      if (err.name === "CastError") {
        return res
          .status(INVALID_DATA.code)
          .send({ message: INVALID_DATA.message });
      }
      return res
        .status(SERVER_ERROR.code)
        .send({ message: SERVER_ERROR.message });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res
          .status(INVALID_DATA.code)
          .send({ message: INVALID_DATA.message });
      }
      return res
        .status(SERVER_ERROR.code)
        .send({ message: SERVER_ERROR.message });
    });
};

module.exports = { getUsers, createUser, getUser };
