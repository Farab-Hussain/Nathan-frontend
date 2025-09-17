"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@/hooks/useUser";

type Flavor = {
  id: string;
  name: string;
  aliases: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  name: string;
  productCount: number;
};

type InventoryAlert = {
  flavorId: string;
  flavorName: string;
  currentStock: number;
  minThreshold: number;
};

type SystemConfig = {
  defaultPrice: number;
  minStockThreshold: number;
  maxFlavorsPerProduct: number;
  supportedCategories: string[];
};

const AdminPage = () => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "flavors" | "categories" | "inventory" | "config"
  >("flavors");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flavors state
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [newFlavor, setNewFlavor] = useState({ name: "", aliases: "" });
  const [creatingFlavor, setCreatingFlavor] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState<string | null>(null);
  const [editFlavorData, setEditFlavorData] = useState({
    name: "",
    aliases: "",
    active: true,
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Inventory state
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [updatingInventory, setUpdatingInventory] = useState<{
    [key: string]: boolean;
  }>({});

  // Config state
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case "flavors":
          await fetchFlavors();
          break;
        case "categories":
          await fetchCategories();
          break;
        case "inventory":
          await fetchInventoryAlerts();
          break;
        case "config":
          await fetchSystemConfig();
          break;
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFlavors = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get(`${API_URL}/admin/flavors`, {
        withCredentials: true,
      });
      // Ensure data is an array
      if (Array.isArray(data)) {
        setFlavors(data);
      } else {
        console.warn("Flavors API returned non-array data:", data);
        setFlavors([]);
      }
    } catch (err) {
      console.error("Failed to fetch flavors:", err);
      // If the new admin endpoint doesn't exist yet, try the old one
      try {
        const { data } = await axios.get(`${API_URL}/3pack/admin/flavors`, {
          withCredentials: true,
        });
        if (Array.isArray(data)) {
          setFlavors(data);
        } else {
          setFlavors([]);
        }
      } catch (fallbackErr) {
        console.error("Fallback flavors fetch also failed:", fallbackErr);
        setFlavors([]);
      }
    }
  };

  const fetchCategories = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get(`${API_URL}/admin/categories`, {
        withCredentials: true,
      });
      // Ensure data is an array
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.warn("Categories API returned non-array data:", data);
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  const fetchInventoryAlerts = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get(`${API_URL}/admin/inventory/alerts`, {
        withCredentials: true,
      });
      // Ensure data is an array
      if (Array.isArray(data)) {
        setInventoryAlerts(data);
      } else {
        console.warn("Inventory alerts API returned non-array data:", data);
        setInventoryAlerts([]);
      }
    } catch (err) {
      console.error("Failed to fetch inventory alerts:", err);
      setInventoryAlerts([]);
    }
  };

  const fetchSystemConfig = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get(`${API_URL}/admin/config`, {
        withCredentials: true,
      });
      setSystemConfig(data);
    } catch (err) {
      console.error("Failed to fetch system config:", err);
      setSystemConfig(null);
    }
  };

  const createFlavor = async () => {
    if (!newFlavor.name.trim()) {
      setError("Flavor name is required");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setCreatingFlavor(true);
    setError(null);
    try {
      const aliasesArray = newFlavor.aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter((alias) => alias.length > 0);

      const { data } = await axios.post(
        `${API_URL}/admin/flavors`,
        {
          name: newFlavor.name.trim(),
          aliases: aliasesArray,
          active: true,
        },
        {
          withCredentials: true,
        }
      );

      setFlavors((prev) => [...prev, data]);
      setNewFlavor({ name: "", aliases: "" });
    } catch (err) {
      setError("Failed to create flavor");
    } finally {
      setCreatingFlavor(false);
    }
  };

  const updateFlavor = async (id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setError(null);
    try {
      const aliasesArray = editFlavorData.aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter((alias) => alias.length > 0);

      const { data } = await axios.put(
        `${API_URL}/admin/flavors/${id}`,
        {
          name: editFlavorData.name.trim(),
          aliases: aliasesArray,
          active: editFlavorData.active,
        },
        {
          withCredentials: true,
        }
      );

      setFlavors((prev) => prev.map((f) => (f.id === id ? data : f)));
      setEditingFlavor(null);
    } catch (err) {
      setError("Failed to update flavor");
    }
  };

  const deleteFlavor = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this flavor? This will affect any products using it."
      )
    ) {
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setError(null);
    try {
      await axios.delete(`${API_URL}/admin/flavors/${id}`, {
        withCredentials: true,
      });

      setFlavors((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError("Failed to delete flavor");
    }
  };

  const createCategory = async () => {
    if (!newCategory.trim()) {
      setError("Category name is required");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setCreatingCategory(true);
    setError(null);
    try {
      await axios.post(
        `${API_URL}/admin/categories`,
        { name: newCategory.trim() },
        {
          withCredentials: true,
        }
      );

      await fetchCategories(); // Refresh categories
      setNewCategory("");
    } catch (err) {
      setError("Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  };

  const updateInventory = async (flavorId: string, newStock: number) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setUpdatingInventory((prev) => ({ ...prev, [flavorId]: true }));
    setError(null);
    try {
      await axios.put(
        `${API_URL}/admin/inventory/${flavorId}`,
        { stock: newStock },
        {
          withCredentials: true,
        }
      );

      await fetchInventoryAlerts(); // Refresh alerts
    } catch (err) {
      setError("Failed to update inventory");
    } finally {
      setUpdatingInventory((prev) => ({ ...prev, [flavorId]: false }));
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
          <p className="text-black text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-black mb-6">
        Admin Management
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "flavors", label: "Flavors" },
          { id: "categories", label: "Categories" },
          { id: "inventory", label: "Inventory" },
          { id: "config", label: "System Config" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-[#FF5D39] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Flavors Tab */}
      {activeTab === "flavors" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              Manage Flavors
            </h2>

            {/* Create New Flavor */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-black mb-3">
                Add New Flavor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flavor Name *
                  </label>
                  <input
                    type="text"
                    value={newFlavor.name}
                    onChange={(e) =>
                      setNewFlavor({ ...newFlavor, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white"
                    placeholder="e.g., Chocolate Mint"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aliases (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newFlavor.aliases}
                    onChange={(e) =>
                      setNewFlavor({ ...newFlavor, aliases: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white"
                    placeholder="e.g., choco, mint, chocolate"
                  />
                </div>
              </div>
              <button
                onClick={createFlavor}
                disabled={creatingFlavor || !newFlavor.name.trim()}
                className="mt-3 bg-[#FF5D39] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingFlavor ? "Creating..." : "Create Flavor"}
              </button>
            </div>

            {/* Flavors List */}
            <div className="space-y-3">
              {Array.isArray(flavors) &&
                flavors.map((flavor) => (
                  <div
                    key={flavor.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    {editingFlavor === flavor.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={editFlavorData.name}
                          onChange={(e) =>
                            setEditFlavorData({
                              ...editFlavorData,
                              name: e.target.value,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white"
                        />
                        <input
                          type="text"
                          value={editFlavorData.aliases}
                          onChange={(e) =>
                            setEditFlavorData({
                              ...editFlavorData,
                              aliases: e.target.value,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white"
                          placeholder="Aliases (comma-separated)"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editFlavorData.active}
                              onChange={(e) =>
                                setEditFlavorData({
                                  ...editFlavorData,
                                  active: e.target.checked,
                                })
                              }
                            />
                            Active
                          </label>
                          <button
                            onClick={() => updateFlavor(flavor.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingFlavor(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-black">
                              {flavor.name}
                            </h4>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                flavor.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {flavor.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          {flavor.aliases.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              Aliases: {flavor.aliases.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingFlavor(flavor.id);
                              setEditFlavorData({
                                name: flavor.name,
                                aliases: flavor.aliases.join(", "),
                                active: flavor.active,
                              });
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFlavor(flavor.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              {(!Array.isArray(flavors) || flavors.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No flavors found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              Manage Categories
            </h2>

            {/* Create New Category */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-black mb-3">
                Add New Category
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white"
                  placeholder="e.g., Premium, Organic, Sugar-Free"
                />
                <button
                  onClick={createCategory}
                  disabled={creatingCategory || !newCategory.trim()}
                  className="bg-[#FF5D39] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingCategory ? "Creating..." : "Create Category"}
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-3">
              {Array.isArray(categories) &&
                categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold text-black">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {category.productCount} products
                      </p>
                    </div>
                  </div>
                ))}
              {(!Array.isArray(categories) || categories.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No categories found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              Inventory Management
            </h2>

            {Array.isArray(inventoryAlerts) && inventoryAlerts.length > 0 ? (
              <div className="space-y-3">
                {inventoryAlerts.map((alert) => (
                  <div
                    key={alert.flavorId}
                    className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold text-red-800">
                        {alert.flavorName}
                      </h4>
                      <p className="text-sm text-red-600">
                        Current: {alert.currentStock} | Min Threshold:{" "}
                        {alert.minThreshold}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={alert.currentStock}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const newStock = parseInt(
                              (e.target as HTMLInputElement).value
                            );
                            if (!isNaN(newStock)) {
                              updateInventory(alert.flavorId, newStock);
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector(
                            `input[defaultValue="${alert.currentStock}"]`
                          ) as HTMLInputElement;
                          const newStock = parseInt(input.value);
                          if (!isNaN(newStock)) {
                            updateInventory(alert.flavorId, newStock);
                          }
                        }}
                        disabled={updatingInventory[alert.flavorId]}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        {updatingInventory[alert.flavorId]
                          ? "Updating..."
                          : "Update"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No inventory alerts at this time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Config Tab */}
      {activeTab === "config" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              System Configuration
            </h2>

            {systemConfig ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">
                      Default Price
                    </h4>
                    <p className="text-lg text-[#FF5D39] font-bold">
                      ${systemConfig.defaultPrice}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">
                      Min Stock Threshold
                    </h4>
                    <p className="text-lg text-[#FF5D39] font-bold">
                      {systemConfig.minStockThreshold}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">
                      Max Flavors Per Product
                    </h4>
                    <p className="text-lg text-[#FF5D39] font-bold">
                      {systemConfig.maxFlavorsPerProduct}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">
                      Supported Categories
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(systemConfig.supportedCategories) &&
                        systemConfig.supportedCategories.map(
                          (category, index) => (
                            <span
                              key={index}
                              className="bg-[#FF5D39] text-white px-2 py-1 rounded text-sm"
                            >
                              {category}
                            </span>
                          )
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Unable to load system configuration.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
