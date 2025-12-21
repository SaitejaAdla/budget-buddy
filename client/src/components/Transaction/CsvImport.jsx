// src/components/transactions/CsvImport.jsx

import { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const CsvImport = ({ goals, onClose, onImportSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("upload");
  const [previewTransactions, setPreviewTransactions] = useState([]);
  const [importSummary, setImportSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please select a valid .csv file.");
    }
  };

  const handleUploadPreview = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}transactions/upload-csv`,
        formData,
        config
      );
      setPreviewTransactions(
        response.data.previewTransactions.map((tx) => ({
          ...tx,
          goal: "",
          goalContributionAmount: "",
        }))
      );
      setStep("preview");
    } catch (err) {
      console.error("Error uploading CSV for preview:", err);
      toast.error(err.response?.data?.message || "Failed to parse CSV.");
      setError(
        "Failed to parse CSV. Please check the file format and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionChange = (index, field, value) => {
    const updatedTransactions = [...previewTransactions];
    updatedTransactions[index][field] = value;
    if (field === "goal" && value === "") {
      updatedTransactions[index]["goalContributionAmount"] = "";
    }
    setPreviewTransactions(updatedTransactions);
  };

  const handleConfirmImport = async () => {
    setStep("importing");
    setLoading(true);
    const payload = {
      transactions: previewTransactions.map((tx) => ({
        ...tx,
        goalContributionAmount: parseFloat(tx.goalContributionAmount) || 0,
      })),
    };
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}transactions/import`,
        payload,
        config
      );
      setImportSummary(data.summary);
      setStep("summary");
      if (data.summary.successful > 0) {
        onImportSuccess();
      }
    } catch (err) {
      console.error("Error importing transactions:", err);
      toast.error(
        err.response?.data?.message ||
          "An unexpected error occurred during import."
      );
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-indigo-600">
            Import Transactions from CSV
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                Step 1: Upload Your File
              </h3>
              <p className="text-gray-600 mb-6">
                Select a CSV file with your transaction history.
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <button
                onClick={handleUploadPreview}
                disabled={!file || loading}
                className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {loading && <Spinner />}
                {loading ? "Processing..." : "Upload & Preview"}
              </button>
            </div>
          )}

          {/* Step 2: Preview & Confirm */}
          {step === "preview" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Step 2: Review and Confirm Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Amount (₹)</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Assign to Goal (for Income)</th>
                      <th className="px-4 py-3">Contribution (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewTransactions.map((tx, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">
                          {format(new Date(tx.date), "dd MMM yyyy")}
                        </td>
                        <td className="px-4 py-2 capitalize">{tx.type}</td>
                        <td className="px-4 py-2">{tx.category}</td>
                        <td className="px-4 py-2 text-right">
                          {tx.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="px-4 py-2">
                          {tx.type === "income" ? (
                            <select
                              value={tx.goal}
                              onChange={(e) =>
                                handleTransactionChange(
                                  index,
                                  "goal",
                                  e.target.value
                                )
                              }
                              className="w-full p-1 border rounded-md text-xs"
                            >
                              <option value="">-- No Goal --</option>
                              {goals.map((goal) => (
                                <option key={goal._id} value={goal._id}>
                                  {goal.name || goal.title}
                                </option>
                              ))}
                            </select>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {tx.type === "income" && tx.goal && (
                            <input
                              type="number"
                              value={tx.goalContributionAmount}
                              onChange={(e) =>
                                handleTransactionChange(
                                  index,
                                  "goalContributionAmount",
                                  e.target.value
                                )
                              }
                              placeholder="Amount"
                              className="w-full p-1 border rounded-md text-xs"
                              max={tx.amount}
                              min="0"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3: Importing */}
          {step === "importing" && (
            <div className="text-center py-10">
              <div className="flex justify-center items-center gap-4">
                <Spinner />
                <h3 className="text-lg font-semibold">
                  Importing Transactions...
                </h3>
              </div>
              <p className="text-gray-600">
                Please wait while we save your data.
              </p>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === "summary" && importSummary && (
            <div className="text-center py-10">
              <h3 className="text-2xl font-bold text-green-600 mb-4">
                Import Complete!
              </h3>
              <p>
                ✅{" "}
                <strong className="font-semibold">
                  {importSummary.successful}
                </strong>{" "}
                transactions imported successfully.
              </p>
              {importSummary.failed > 0 && (
                <p className="text-red-500">
                  ❌{" "}
                  <strong className="font-semibold">
                    {importSummary.failed}
                  </strong>{" "}
                  transactions failed to import.
                </p>
              )}
              {importSummary.errors?.length > 0 && (
                <div className="mt-4 text-left bg-red-50 p-4 rounded-md">
                  <h4 className="font-semibold text-red-700">Error Details:</h4>
                  <ul className="list-disc list-inside text-sm text-red-600">
                    {importSummary.errors.map((e, i) => (
                      <li key={i}>
                        <strong>{e.transaction}:</strong> {e.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={onClose}
                className="mt-8 bg-indigo-600 text-white font-bold py-2 px-6 rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          )}
        </main>

        <footer className="p-4 border-t flex justify-end gap-4">
          {step === "preview" && (
            <>
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300"
              >
                {loading && <Spinner />}
                Confirm & Import
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};

export default CsvImport;
