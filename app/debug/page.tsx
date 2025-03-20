export const dynamic = "force-dynamic";

export default function DebugPage() {
  // This will only run on the server in SSR mode
  const serverInfo = {
    serverTime: new Date().toISOString(),
    node: process.version,
    env: process.env.NODE_ENV,
    runtimeEnv: process.env.NEXT_RUNTIME || "unknown",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Debug Page</h1>
          <p className="text-center mt-2">
            This page tests server-side rendering
          </p>
        </div>

        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Server Information</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(serverInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white shadow p-6 rounded-lg mt-4">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <ul className="space-y-2">
            <li>
              <strong>NEXT_FORCE_DYNAMIC:</strong>{" "}
              {process.env.NEXT_FORCE_DYNAMIC || "not set"}
            </li>
            <li>
              <strong>VERCEL_URL:</strong> {process.env.VERCEL_URL || "not set"}
            </li>
            <li>
              <strong>NETLIFY:</strong> {process.env.NETLIFY || "not set"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
