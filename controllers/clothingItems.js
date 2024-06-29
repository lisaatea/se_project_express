const ClothingItem = require("../models/clothingItem");
const { INVALID_DATA, NOT_FOUND, SERVER_ERROR } = require("../utils/errors");

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      return res
        .status(SERVER_ERROR.code)
        .send({ message: SERVER_ERROR.message });
    });
};

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.status(201).send({ data: item });
    })
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

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then(() => res.status(200).send({}))
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

const likeItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((updatedItem) => {
      res.status(200).send(updatedItem);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND.code).send({ message: NOT_FOUND.message });
      }
      if (err.message === "Item not found") {
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

const dislikeItem = (req, res) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((updatedItem) => {
      res.status(200).send(updatedItem);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND.code).send({ message: NOT_FOUND.message });
      }
      if (err.message === "Item not found") {
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

module.exports = { getItems, createItem, deleteItem, likeItem, dislikeItem };
