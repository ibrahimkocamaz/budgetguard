import Navbar from "@/app/components/Navbar";
import CategoryManager from "@/app/components/CategoryManager";
import { getSession } from "@/app/lib/session";

export default async function SettingsPage() {
  const user = await getSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Settings
              </h2>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#categories"
                      className="block px-4 py-2 text-blue-500 bg-blue-50 rounded"
                    >
                      Categories
                    </a>
                  </li>
                  {/* Add more settings navigation items here in the future */}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div id="categories">
              <CategoryManager />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
