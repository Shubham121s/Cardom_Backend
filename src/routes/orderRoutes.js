const routes = require("express").Router();
const order = require("../controllers/order.js");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

// const router = express.Router();

// router.route("/new").post(newOrder);
routes.post("/new", isAuthenticatedUser, order.newOrder);
routes.route("/details/:id").get(isAuthenticatedUser, order.singleOrderdetails);
routes.route("/me").get(isAuthenticatedUser, order.myOrders);
routes
  .route("/admin/all")
  .get(isAuthenticatedUser, authorizeRoles("Admin"), order.allOrders);
routes
  .route("/admin/change/:id")
  .put(isAuthenticatedUser, authorizeRoles("Admin"), order.updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("Admin"), order.deleteOrder);

module.exports = routes;
