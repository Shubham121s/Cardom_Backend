const routes = require("express").Router();
const carBrand = require("../controllers/carBrand");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/auth.js");

routes.post(
  "/",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carBrand.newCarBrand
);

routes.put(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carBrand.updateCarBrand
);

routes.delete(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carBrand.deleteCarBrand
);
routes.get("/", carBrand.getCarBrand);

module.exports = routes;
