const routes = require("express").Router();
const cartItem = require("../controllers/cartItem");
const { isAuthenticatedUser } = require("../middleware/auth.js");

routes.get("/", isAuthenticatedUser, cartItem.getItemToCart);
routes.post("/", isAuthenticatedUser, cartItem.addItemToCart);
routes.put("/:id", isAuthenticatedUser, cartItem.updateItemToCart);
routes.delete("/clear", isAuthenticatedUser, cartItem.clearItemToCart);
routes.delete("/:id", isAuthenticatedUser, cartItem.deleteItemToCart);

module.exports = routes;
