const routes = require("express").Router();
const admin = require("../controllers/admin.js");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/auth.js");

routes.delete(
  "/car/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  admin.deleteCarHandlerByAdmin
);

routes.delete(
  "/user/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  admin.deleteUserByAdmin
);
routes.get(
  "/getAllUser",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  admin.getAllUesrs
);

routes.post(
  "/user/new",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  admin.createUserByAdmin
);

module.exports = routes;
