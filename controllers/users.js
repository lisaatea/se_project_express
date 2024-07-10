const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

const {
  INVALID_DATA,
  NOT_FOUND,
  SERVER_ERROR,
  CONFLICT,
  UNAUTHORIZED,
} = require("../utils/errors");

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;
  if (!email) {
    return res
      .status(INVALID_DATA.code)
      .send({ message: INVALID_DATA.message });
  }
  return User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new Error(CONFLICT.message);
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res
          .status(INVALID_DATA.code)
          .send({ message: INVALID_DATA.message });
      }
      if (err.code === 11000) {
        return res.status(CONFLICT.code).send({ message: CONFLICT.message });
      }
      if (err.message === CONFLICT.message) {
        return res.status(CONFLICT.code).send({ message: CONFLICT.message });
      }
      return res
        .status(SERVER_ERROR.code)
        .send({ message: SERVER_ERROR.message });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(INVALID_DATA.code)
      .send({ message: INVALID_DATA.message });
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new Error(UNAUTHORIZED.message);
      }
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.status(200).json({
        token,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        id: user._id,
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        return res
          .status(UNAUTHORIZED.code)
          .send({ message: UNAUTHORIZED.message });
      }
      return res
        .status(SERVER_ERROR.code)
        .send({ message: SERVER_ERROR.message });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
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

const updateCurrentUser = (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND.code).send({ message: NOT_FOUND.message });
      }
      if (err.name === "CastError" || err.name === "ValidationError") {
        return res
          .status(INVALID_DATA.code)
          .send({ message: INVALID_DATA.message });
      }
      return res
        .status(SERVER_ERROR.code)
        .send({ message: SERVER_ERROR.message });
    });
};

module.exports = { createUser, login, getCurrentUser, updateCurrentUser };
