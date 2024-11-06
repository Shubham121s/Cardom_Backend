const routes = require("express").Router();
const carState = require("../controllers/state.js");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/auth.js");

routes.post(
  "/",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  carState.createState
);
// routes.put(
//   "/:id",
//   isAuthenticatedUser,
//   authorizeRoles("Admin"),
//   carState.updateState
// );
// routes.delete(
//   "/:id",
//   isAuthenticatedUser,
//   authorizeRoles("Admin"),
//   carState.deleteState
// );
routes.get("/", carState.getState);

module.exports = routes;
