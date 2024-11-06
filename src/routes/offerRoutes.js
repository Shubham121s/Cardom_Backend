const routes = require("express").Router();
const offers = require("../controllers/offers.js");
const { isAuthenticatedUser } = require("../middleware/auth.js");

routes.post("/", isAuthenticatedUser, offers.createOffer);
routes.get("/:carId", isAuthenticatedUser, offers.getUserCarOffer);
routes.get("/:carId/seller", isAuthenticatedUser, offers.getCarOfferBySeller);
routes.put("/:offerId/seller", isAuthenticatedUser, offers.updateOfferBySeller);
routes.delete("/:offerId", isAuthenticatedUser, offers.deleteOfferByBuyer);

module.exports = routes;
