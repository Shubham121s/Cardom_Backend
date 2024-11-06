const routes = require("express").Router();
const carVariant = require("../controllers/carVariant");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/auth.js");

routes.post(
  "/",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carVariant.newCarVariant
);

routes.put(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carVariant.updateCarVariant
);

routes.delete(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carVariant.deleteCarVariant
);
routes.get("/", carVariant.getCarVariant);

module.exports = routes;