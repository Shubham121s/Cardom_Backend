const routes = require("express").Router();
const carModel = require("../controllers/carModel.js");
const { isAuthenticatedUser } = require("../middleware/auth.js");

routes.post("/", carModel.createCarModel);
routes.get("/", carModel.getAllCarsModel);
routes.put("/:id", carModel.updateCarModel);
routes.delete("/:id", carModel.deleteCarModel);

module.exports = routes;
