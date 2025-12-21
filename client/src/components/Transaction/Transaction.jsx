// src/pages/Transaction.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import TransactionList from "./TransactionList";
import TransactionForm from "./TransactionForm";
import CsvImport from "./CsvImport"; 
import Footer from "../Footer";
import Navbar from "../Navbar";

const Transaction = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(true); 
  const [showImportModal, setShowImportModal] = useState(false); 
  const token = user?.token;
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchTransactions = async () => {
    if (!token) return logout();
    setLoadingTransactions(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}transactions`,
        config
      );
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (error.response?.status === 401) logout();
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchGoals = async () => {
    if (!token) return logout();

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}goals`,
        config
      );
      setGoals(res.data.goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to fetch goals");
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchGoals();
  }, []);

  const handleAddTransaction = async (payload) => {
    if (!token) return logout();
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}transactions`,
        payload,
        config
      );
      setTransactions((prev) => [response.data.transaction, ...prev]);
      toast.success(
        response.data.budgetWarning
          ? `Transaction added! ${response.data.budgetWarning}`
          : "Transaction added successfully!"
      );
      fetchGoals(); 
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response.data.message.includes("Budget limit exceeded")
      ) {
        toast.error(error.response.data.message);
        setTimeout(() => navigate("/budgets"), 2000);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to add transaction"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const originalTransactions = [...transactions];
    setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    const deletingToast = toast.loading("Deleting...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}transactions/${id}`,
        config
      );
      toast.success("Transaction deleted", { id: deletingToast });
      fetchGoals(); 
    } catch (error) {
      setTransactions(originalTransactions);
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction", { id: deletingToast });
    }
  };

  const handleImportSuccess = () => {
    toast.success("Data refreshed with imported transactions!");
    fetchTransactions(); 
    fetchGoals(); 
    setShowImportModal(false); 
  };

  return (
    <>
      <div className="min-h-screen bg-blue-50">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4 sm:p-6">
          <h1 className="text-3xl text-center font-bold text-indigo-600 mb-6 select-none">
            Transactions
          </h1>
          <section className="bg-white p-6 rounded-xl shadow-md mb-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
              <h2 className="text-2xl font-semibold text-indigo-600">
                Add New Transaction
              </h2>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm w-full sm:w-auto"
              >
                Import from CSV
              </button>
            </div>
            <TransactionForm
              goals={goals}
              onAdd={handleAddTransaction}
              loading={loading}
            />
          </section>
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
              Transaction History
            </h2>
            {loadingTransactions ? (
              <div
                className="flex justify-center items-center py-10"
                aria-label="Loading transactions"
              >
                <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : (
              <TransactionList
                transactions={transactions}
                goals={goals}
                onDelete={handleDelete}
              />
            )}
          </section>
        </main>
        <Footer />
      </div>
      {showImportModal && (
        <CsvImport
          goals={goals}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </>
  );
};

export default Transaction;
