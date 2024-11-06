const routes = require("express").Router();
const payment = require("../controllers/payment.js");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

routes.post("/createPaymentOrder", payment.createPaymentOrder);
routes.post("/paymentSuccess", payment.paymentSuccess);
routes.put("/paymentFailed", payment.paymentFailed);

module.exports = routes;
