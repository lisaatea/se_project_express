const ClothingItem = require("../models/clothingItem");
const BadRequestError = require("../errors/bad-request-error");
const NotFoundError = require("../errors/not-found-error");
const ForbiddenError = require("../errors/forbidden-error");

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .populate("owner")
    .sort({ createdAt: -1 })
    .then((items) => res.status(200).send(items))
    .catch(next);
};

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.status(201).send({ data: item });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid data provided"));
      } else {
        next(err);
      }
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  ClothingItem.findById(itemId)
    .orFail(() => new NotFoundError("Item not found"))
    .then((item) => {
      if (item.owner.toString() !== req.user._id.toString()) {
        throw new ForbiddenError("You are not authorized to delete this item");
      }
      return ClothingItem.findByIdAndDelete(itemId);
    })
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID"));
      } else {
        next(err);
      }
    });
};

const likeItem = (req, res, next) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => new NotFoundError("Item not found"))
    .populate("owner")
    .then((updatedItem) => {
      res.status(200).send(updatedItem);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID"));
      } else {
        next(err);
      }
    });
};

const dislikeItem = (req, res, next) => {
  const { itemId } = req.params;
  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => new NotFoundError("Item not found"))
    .populate("owner")
    .then((updatedItem) => {
      res.status(200).send(updatedItem);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID"));
      } else {
        next(err);
      }
    });
};

module.exports = { getItems, createItem, deleteItem, likeItem, dislikeItem };
