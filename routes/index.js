const router = require("express").Router();
const { login, createUser } = require("../controllers/users");
const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");
const { NOT_FOUND } = require("../utils/errors");

router.post("/signup", createUser);
router.post("/signin", login);

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

router.use((req, res) => {
  res.status(NOT_FOUND.code).send({ message: NOT_FOUND.message });
});

module.exports = router;
