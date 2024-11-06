const routes = require("express").Router();
const users = require("../controllers/users.js");
const passport = require("passport");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/auth.js");

routes.post("/googleLogin", users.loginWithGoogle);
routes.post("/register", users.register);
routes.post("/login", users.login);
routes.post(
  "/facebookLogin",
  passport.authenticate("facebook-token"),
  users.loginWithFacebook
);
routes.post("/sendOtp", users.sendOtp);
routes.post("/verifyOtp", users.verifyOtp);
routes.post("/resetPassword", users.resetPassword);
routes.post("/logout", isAuthenticatedUser, users.logout);
routes.post("/updateProfile", isAuthenticatedUser, users.updateProfile);
routes.post("/changePassword", isAuthenticatedUser, users.changePassword);
routes.get("/profile", isAuthenticatedUser, users.userProfile);
routes.post("/addresses", isAuthenticatedUser, users.createAddress);
routes.put("/addresses/:addressId", isAuthenticatedUser, users.updateAddress);
routes.delete(
  "/addresses/:addressId",
  isAuthenticatedUser,
  users.deleteAddress
);
routes.get("/getSingleUser/:id", users.getSingleUser);
routes.post("/verifyMobileOtp", users.verifyMobileOtp);
routes.post("/resendOtp", users.resendOtp);

module.exports = routes;
