const express = require("express");
const router = express.Router();

// Import user, car and admin routes
const userRoutes = require("./userRoutes");
const carRoutes = require("./carRoutes");
const adminRoutes = require("./adminRoutes");
const offersRoutes = require("./offerRoutes");
const orderRoutes = require("./orderRoutes");
const paymentRoutes = require("./paymentRoutes");
const transactionRoutes = require("./transactionRoutes");
const cartItemRoutes = require("./cartItemRoutes");
const carBrandRoutes = require("./carBrandRoutes");
const carModelRoutes = require("./carModelRoutes");
const carVariantRoutes = require("./carVariantRoutes");
const storage = require("./storage");
const rtoRoutes = require("./rtoRoutes");
const stateRoutes = require("./stateRoutes");
const testDriveRoutes = require("./testDriveRoute");

// Use the routes
router.use("/auth", userRoutes);
router.use("/cars", carRoutes);
router.use("/account", adminRoutes);
router.use("/offers", offersRoutes);
router.use("/order", orderRoutes);
router.use("/payment", paymentRoutes);
router.use("/transaction", transactionRoutes);
router.use("/cartItem", cartItemRoutes);
router.use("/carBrand", carBrandRoutes);
router.use("/carModel", carModelRoutes);
router.use("/carVariant", carVariantRoutes);
router.use("/storage", storage);
router.use("/RTO", rtoRoutes);
router.use("/carstate", stateRoutes);
router.use("/testDrive", testDriveRoutes);

module.exports = router;
