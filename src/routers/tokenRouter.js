"use strict";

const router = require("express").Router();
const {
  listTokens,
  readToken,
  createToken,
  destroyToken,
} = require("../controllers/tokenController");
const { isAdmin } = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");

// BASE_URL: /tokens

router.use(isAdmin);
router.route("/").get(listTokens).post(createToken);
router.route("/:id").all(idValidation).get(readToken).delete(destroyToken);

module.exports = router;
