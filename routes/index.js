const router = require("express").Router();
const { login, createUser } = require("../controllers/users");
const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");
const NotFoundError = require("../errors/not-found-error");
const {
  validateUserInfo,
  validateAuthentication,
} = require("../middlewares/validation");

router.post("/signup", validateUserInfo, createUser);
router.post("/signin", validateAuthentication, login);

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

router.use(() => {
  throw new NotFoundError("Route not found");
});

module.exports = router;
