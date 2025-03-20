"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        // Test a simple endpoint
        const response = await fetch("/api/health-check", {
          method: "GET",
        });

        const data = await response.json();
        setApiResponse(data);

        if (response.ok) {
          setApiStatus("success");
        } else {
          setApiStatus("error");
          setErrorMessage(`API returned status ${response.status}`);
        }
      } catch (error) {
        console.error("API test error:", error);
        setApiStatus("error");
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };

    testAPI();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            API Test Page
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This page tests if your API endpoints are working
          </p>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">API Status</h3>

          {apiStatus === "loading" && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded">
              Testing API connection...
            </div>
          )}

          {apiStatus === "success" && (
            <div className="bg-green-50 text-green-700 p-4 rounded">
              API is working correctly!
            </div>
          )}

          {apiStatus === "error" && (
            <div className="bg-red-50 text-red-700 p-4 rounded">
              <p className="font-bold">API Error:</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {apiResponse && (
            <div className="mt-4">
              <p className="font-medium">Response:</p>
              <pre className="bg-gray-50 p-3 rounded mt-2 text-sm overflow-auto">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
