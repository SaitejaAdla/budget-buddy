// // routes/transactionRoutes.js
// const express = require("express");
// const router = express.Router();

// const {
//   createTransaction,
//   getTransactions,
//   deleteTransaction,
//   getDashboardStats,
//   getIncomeExpenseByPeriod,
// } = require("../controllers/transactionController");

// const authMiddleware = require("../middleware/authMiddleware");

// router.post("/", authMiddleware, createTransaction);
// router.get("/", authMiddleware, getTransactions);
// router.delete("/:id", authMiddleware, deleteTransaction);
// // new dashboard stats route
// router.get("/dashboard/stats", authMiddleware, getDashboardStats);
// // New route for income-expense by period
// router.get(
//   "/dashboard/income-expense",
//   authMiddleware,
//   getIncomeExpenseByPeriod
// );

// module.exports = router;

// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createTransaction,
  getTransactions,
  deleteTransaction,
  getDashboardStats,
  getIncomeExpenseByPeriod,
  previewCsvTransactions,
  importTransactions,
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authMiddleware, createTransaction);
router.get("/", authMiddleware, getTransactions);
router.delete("/:id", authMiddleware, deleteTransaction);
router.get("/dashboard/stats", authMiddleware, getDashboardStats);
router.get(
  "/dashboard/income-expense",
  authMiddleware,
  getIncomeExpenseByPeriod
);
router.post(
  "/upload-csv",
  authMiddleware,
  upload.single("file"),
  previewCsvTransactions
);
router.post("/import", authMiddleware, importTransactions);

module.exports = router;
