const db = require("../../database");
const fetch = require("node-fetch");

class DepositProcessor {
  constructor() {
    this.isRunning = false;
    this.interval = null;
  }

  async processDeposits() {
    try {
      const config = await db.readData("config.json");
      const blockchainApiUrl = config.blockchainApiUrl;

      // Fetch blockchain transactions
      const response = await fetch(blockchainApiUrl);
      if (!response.ok) {
        console.error("Failed to fetch blockchain data");
        return;
      }

      const blockchainTransactions = await response.json();

      // Sort transactions by timestamp (oldest to newest)
      blockchainTransactions.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      const newestDepositID = await db.getNewestDepositID();

      let processedCount = 0;
      let lastProcessedID = newestDepositID;

      for (const tx of blockchainTransactions) {
        // Skip if we've already processed this transaction
        if (newestDepositID && tx._id === newestDepositID) {
          break;
        }

        // Check if this is a deposit to our exchange wallet
        if (tx.to === config.exchangeWalletAddress) {
          // Find user by wallet address
          const uid = await db.getUIDbyWalletAddress(tx.from);

          if (uid) {
            // Process deposit
            await db.deposit(uid, tx.amount);
            processedCount++;
            console.log(`Processed deposit: ${tx.amount} to user ${uid}`);
          }
        }

        lastProcessedID = tx._id;
      }

      // Update newest deposit ID
      if (lastProcessedID !== newestDepositID) {
        await db.setNewestDepositID(lastProcessedID);
      }

      if (processedCount > 0) {
        console.log(`Processed ${processedCount} new deposits`);
      }
    } catch (error) {
      console.error("Error processing deposits:", error);
    }
  }

  start() {
    if (this.isRunning) {
      console.log("Deposit processor is already running");
      return;
    }

    console.log("Starting deposit processor...");
    this.isRunning = true;

    // Process immediately
    this.processDeposits();

    // Then process every 3 seconds
    this.interval = setInterval(() => {
      this.processDeposits();
    }, 3000);
  }

  stop() {
    if (!this.isRunning) {
      console.log("Deposit processor is not running");
      return;
    }

    console.log("Stopping deposit processor...");
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

module.exports = DepositProcessor;
