const routes = require("express").Router();
const cars = require("../controllers/cars");
const { isAuthenticatedUser } = require("../middleware/auth.js");

routes.get("/", cars.getCarsHandler);
routes.get("/seller", isAuthenticatedUser, cars.getCarBySellerHandler);
routes.get("/:id", cars.getSingleCarHandler);

routes.post("/", isAuthenticatedUser, cars.createCarHandler);
routes.put("/:id", isAuthenticatedUser, cars.updateCarHandler);
routes.delete("/:id", isAuthenticatedUser, cars.deleteCarHandler);

module.exports = routes;
