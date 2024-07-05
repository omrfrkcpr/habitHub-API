"use strict";

const router = require("express").Router();
const {
  listTokens,
  readToken,
  createToken,
  destroyToken,
} = require("../controllers/tokenController");
const { isAdmin } = require("../middlewares/permissions");

// BASE_URL: /tokens

router.use(isAdmin);
router.route("/").get(listTokens).post(createToken);
router.route("/:id").get(readToken).delete(destroyToken);

module.exports = router;
