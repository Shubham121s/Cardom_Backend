const routes = require("express").Router();
const testDrive = require("../controllers/testDrive");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middleware/auth.js");

// user
routes.get("/", isAuthenticatedUser, testDrive.getAllTestDrives);
routes.post("/", isAuthenticatedUser, testDrive.createTestDrive);
routes.put("/:id", isAuthenticatedUser, testDrive.updateTestDrive);
routes.delete("/:id", isAuthenticatedUser, testDrive.deleteTestDrive);

// admin
routes.get(
  "/admin",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  testDrive.getAllTestDrivesByAdmin
);
routes.put(
  "/admin/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  testDrive.updateTestDriveByAdmin
);
routes.delete(
  "/admin/:id",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  testDrive.deleteTestDriveByAdmin
);

module.exports = routes;
