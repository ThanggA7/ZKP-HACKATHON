const db = require("../../database");
const express = require("express");
const { requireLogin } = require("../middleware");
const router = express.Router();

// GET /withdraws
router.get("/", requireLogin, async (req, res) => {
  try {
    const withdrawals = await db.getWithdrawHistory(req.session.UID);
    res.json(withdrawals);
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /withdraws
router.post("/", requireLogin, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Số tiền không hợp lệ!" });
    }

    const currentBalance = await db.getBalanceOf(req.session.UID);

    if (currentBalance < amount) {
      return res.status(400).json({ error: "Số dư không đủ!" });
    }

    // Get user info for wallet address
    const userInfo = await db.getUserInfo(req.session.UID);
    const config = await db.readData("config.json");

    // Process withdrawal
    const success = await db.withdraw(req.session.UID, amount);

    if (success) {
      // Here you would typically make a blockchain API call to transfer from exchange wallet to user wallet
      // For now, we'll just log the withdrawal
      console.log(
        `Withdrawal processed: ${amount} from exchange wallet to ${userInfo.walletAddress}`
      );

      res.json({ message: "Rút tiền thành công!", walletAddress: userInfo.walletAddress });
    } else {
      res.status(400).json({ error: "Không thể xử lý rút tiền!" });
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
