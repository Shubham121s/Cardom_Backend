const routes = require("express").Router();
const transaction = require("../controllers/transaction");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

routes.get(
  "/admin",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  transaction.getTransactionByAdmin
);
routes.get("/user", isAuthenticatedUser, transaction.getTransactionByUser);
routes.get("/seller", isAuthenticatedUser, transaction.getTransactionBySeller);

module.exports = routes;
