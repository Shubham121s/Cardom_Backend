const routes = require("express").Router();
const carRtoCodes = require("../controllers/carRto.js");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/auth.js");

routes.post(
  "/",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carRtoCodes.createRTO
);
routes.put(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carRtoCodes.updateRTO
);
routes.delete(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carRtoCodes.deleteRTO
);
routes.get("/", carRtoCodes.getRTOByState);

module.exports = routes;
