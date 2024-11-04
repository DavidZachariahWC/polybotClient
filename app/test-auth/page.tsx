"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function TestAuth() {
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuth();

  useEffect(() => {
    const testAuth = async () => {
      try {
        const token = await getToken();
        const response = await fetch("/api/test-auth", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setTestResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    testAuth();
  }, [getToken]);

  return (
    <div className="p-4 text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}
      
      {testResult && (
        <pre className="bg-gray-100 p-4 rounded text-black">
          {JSON.stringify(testResult, null, 2)}
        </pre>
      )}
    </div>
  );
} 