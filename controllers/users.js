const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

const BadRequestError = require("../errors/bad-request-error");
const NotFoundError = require("../errors/not-found-error");
const ConflictError = require("../errors/conflict-error");
const UnauthorizedError = require("../errors/unauthorized-error");

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;
  if (!email) {
    next(new BadRequestError("Email is required"));
  }
  return User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError("Email already exists");
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(201).send({
        token,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid data provided"));
      } else if (err.code === 11000) {
        next(new ConflictError("Email already exists"));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new BadRequestError("Email and password are required"));
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError("Incorrect email or password");
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
      if (err.message === "Incorrect email or password") {
        next(new UnauthorizedError("Incorrect email or password"));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => new NotFoundError("User not found"))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid data provided"));
      } else {
        next(err);
      }
    });
};

const updateCurrentUser = (req, res, next) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail(() => new NotFoundError("User not found"))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "CastError" || err.name === "ValidationError") {
        next(new BadRequestError("Invalid data provided"));
      } else {
        next(err);
      }
    });
};

module.exports = { createUser, login, getCurrentUser, updateCurrentUser };
