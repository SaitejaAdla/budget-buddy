// controllers/transactionController.js
const Transaction = require("../models/transactionModel");
const Budget = require("../models/budgetModel");
const Goal = require("../models/goalModel");
const csv = require("csv-parser");
const { Readable } = require("stream");

exports.createTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      amount,
      type,
      category,
      date,
      goalId,
      description,
      goalContributionAmount,
    } = req.body;

    const transactionDate = date ? new Date(date) : new Date();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    let contributionAmount = 0;
    if (goalContributionAmount !== undefined) {
      contributionAmount = parseFloat(goalContributionAmount);
      if (
        isNaN(contributionAmount) ||
        contributionAmount < 0 ||
        contributionAmount > parsedAmount
      ) {
        return res.status(400).json({
          message:
            "Invalid goalContributionAmount; must be >= 0 and <= transaction amount.",
        });
      }
    }

    if (type === "expense") {
      // Budget limit checks (unchanged)
      const budget = await Budget.findOne({ user: userId, category });
      if (budget) {
        const start = new Date(transactionDate);
        start.setHours(0, 0, 0, 0);

        if (budget.period === "monthly") {
          start.setDate(1);
        } else if (budget.period === "weekly") {
          const day = start.getDay();
          start.setDate(start.getDate() - day);
        }

        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              user: userId,
              type: "expense",
              category,
              date: { $gte: start },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        const spent = spentAgg[0]?.total || 0;
        const newTotal = spent + parsedAmount;

        if (newTotal > budget.limit) {
          return res.status(400).json({
            message: `\u{1F6A8} Budget limit exceeded for "${category}". Limit: $${budget.limit}, attempted spend: $${newTotal}`,
          });
        }
      }
    }

    // Create transaction including contribution amount
    const transactionData = {
      user: userId,
      amount: parsedAmount,
      type,
      category,
      date: transactionDate,
      description,
      ...(goalId ? { goal: goalId } : {}),
      goalContributionAmount:
        type === "income" && goalId ? contributionAmount : 0,
    };

    const transaction = await Transaction.create(transactionData);

    // Update goal currentAmount by the contribution amount (partial)
    if (type === "income" && goalId && contributionAmount > 0) {
      await Goal.findByIdAndUpdate(goalId, {
        $inc: { currentAmount: contributionAmount },
      });
    }

    // Budget warning for expense (unchanged)
    let budgetWarning = null;
    if (type === "expense") {
      const budget = await Budget.findOne({ user: userId, category });
      if (budget) {
        const start = new Date(transactionDate);
        start.setHours(0, 0, 0, 0);
        if (budget.period === "monthly") {
          start.setDate(1);
        } else if (budget.period === "weekly") {
          const day = start.getDay();
          start.setDate(start.getDate() - day);
        }

        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              user: userId,
              type: "expense",
              category,
              date: { $gte: start },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        const spent = spentAgg[0]?.total || 0;
        if (spent >= 0.8 * budget.limit) {
          budgetWarning = `\u26A0\uFE0F Warning: You're nearing your "${category}" budget limit. ${(
            (spent / budget.limit) *
            100
          ).toFixed(0)}% used.`;
        }
      }
    }

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction,
      budgetWarning,
    });
  } catch (error) {
    console.error("\u274C Error in createTransaction:", error);
    return res.status(500).json({
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};

// Get all transactions for logged-in user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
    });

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

// Delete a transaction by ID for logged-in user
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};

// Get dashboard summary for logged-in user
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate total income
    const incomeAgg = await Transaction.aggregate([
      { $match: { user: userId, type: "income" } },
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } },
    ]);

    // Aggregate total expense
    const expenseAgg = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      { $group: { _id: null, totalExpense: { $sum: "$amount" } } },
    ]);

    // Aggregate spending by category
    const spendingByCategory = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].totalIncome : 0;
    const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].totalExpense : 0;
    const balance = totalIncome - totalExpense;

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
      spendingByCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get dashboard stats",
      error: error.message,
    });
  }
};

exports.getIncomeExpenseByPeriod = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = "day", date } = req.query;
    const refDate = date ? new Date(date) : new Date();

    let startDate, endDate;

    switch (period) {
      case "day":
        startDate = new Date(refDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(refDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "week":
        const day = refDate.getDay();
        startDate = new Date(refDate);
        startDate.setDate(refDate.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "month":
        startDate = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
        endDate = new Date(
          refDate.getFullYear(),
          refDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;

      case "year":
        startDate = new Date(refDate.getFullYear(), 0, 1);
        endDate = new Date(refDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;

      default:
        return res.status(400).json({ message: "Invalid period" });
    }

    const pipeline = [
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            time: "$date", // Use exact transaction date-time from DB
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.time": 1 },
      },
      {
        $project: {
          _id: 0,
          time: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S%z", // full ISO timestamp with timezone offset
              date: "$_id.time",
              timezone: "UTC",
            },
          },
          type: "$_id.type",
          amount: "$total",
        },
      },
    ];

    const aggResults = await Transaction.aggregate(pipeline);

    const income = [];
    const expense = [];

    aggResults.forEach(({ time, type, amount }) => {
      const entry = { time, amount };
      if (type === "income") income.push(entry);
      else if (type === "expense") expense.push(entry);
    });

    console.log("Response Data:", { income, expense }); // For debugging

    res.status(200).json({ income, expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch income and expense data",
      error: error.message,
    });
  }
};

exports.previewCsvTransactions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file uploaded." });
    }

    const userGoals = await Goal.find({
      user: req.user._id,
      status: "In Progress",
    });
    const results = [];
    const fileBuffer = req.file.buffer;
    const stream = Readable.from(fileBuffer);

    stream
      .pipe(csv())
      .on("data", (row) => {
        if (
          !row.Date ||
          !row.Time ||
          typeof row.Date !== "string" ||
          typeof row.Time !== "string"
        ) {
          console.log("Skipping row due to missing Date/Time:", row);
          return;
        }

        const moneyIn = parseFloat(row["Money In"]) || 0;
        const moneyOut = parseFloat(row["Money Out"]) || 0;
        if (moneyIn === 0 && moneyOut === 0) return;

        const type = moneyIn > 0 ? "income" : "expense";
        const amount = Math.abs(moneyIn || moneyOut);

        const dateParts = row.Date.split("/");
        const timeParts = row.Time.split(":");
        const isoDate = new Date(
          +dateParts[2],
          dateParts[1] - 1, // month (is 0-indexed, so April (4) becomes 3)
          +dateParts[0], // day: 16
          +timeParts[0], // hour: 20
          +timeParts[1], // minute: 33
          +timeParts[2] // second: 48
        );
        results.push({
          type,
          amount,
          date: isoDate.toISOString(),
          category: row.Category,
          description: row["Notes and #tags"] || row.Description, // Use Description as a fallback
          goal: null,
          goalContributionAmount: 0,
        });
      })
      .on("end", () => {
        res.status(200).json({
          message:
            "CSV parsed successfully. Please review transactions before importing.",
          previewTransactions: results,
          userGoals: userGoals,
        });
      })
      .on("error", (err) => {
        console.error("Error during CSV stream parsing:", err);
        throw new Error(
          "Failed to parse CSV file. Please check the file format."
        );
      });
  } catch (error) {
    console.error("❌ Error in previewCsvTransactions:", error);
    res.status(500).json({
      message: error.message || "Failed to parse CSV file",
      error: error.message,
    });
  }
};

exports.importTransactions = async (req, res) => {
  const { transactions } = req.body;
  const userId = req.user._id;

  if (
    !transactions ||
    !Array.isArray(transactions) ||
    transactions.length === 0
  ) {
    return res.status(400).json({ message: "No transactions to import." });
  }

  const importSummary = {
    successful: 0,
    failed: 0,
    errors: [],
  };
  for (const txData of transactions) {
    try {
      const parsedAmount = parseFloat(txData.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error(
          `Invalid amount for transaction: ${
            txData.description || txData.category
          }`
        );
      }

      if (txData.type === "expense") {
        const budget = await Budget.findOne({
          user: userId,
          category: txData.category,
        });
        if (budget) {
          console.log(
            `Budget check would run for category: ${txData.category}`
          );
        }
      }

      const transactionToCreate = {
        ...txData,
        user: userId,
        amount: parsedAmount,
        goal: txData.goal || null,
        goalContributionAmount: txData.goalContributionAmount || 0,
      };

      const newTransaction = await Transaction.create(transactionToCreate);

      if (
        newTransaction.type === "income" &&
        newTransaction.goal &&
        newTransaction.goalContributionAmount > 0
      ) {
        await Goal.findByIdAndUpdate(newTransaction.goal, {
          $inc: { currentAmount: newTransaction.goalContributionAmount },
        });
      }

      importSummary.successful++;
    } catch (error) {
      importSummary.failed++;
      importSummary.errors.push({
        transaction: txData.description || txData.category,
        reason: error.message,
      });
    }
  }

  res.status(201).json({
    message: "Import process completed.",
    summary: importSummary,
  });
};
