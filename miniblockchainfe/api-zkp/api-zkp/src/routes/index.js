const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const transactionRoutes = require("./transactionRoutes");
const depositRoutes = require("./depositRoutes");
const withdrawRoutes = require("./withdrawRoutes");

router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/deposits", depositRoutes);
router.use("/withdraws", withdrawRoutes);

// Export the router
module.exports = router;
