"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCartStore } from "@/store/cartStore";
import CustomButton from "@/components/custom/CustomButton";
import FlavorCard from "./FlavorCard";

type Flavor = {
  id: string;
  name: string;
  aliases: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type FlavorInventory = {
  flavorId: string;
  onHand: number;
  reserved: number;
  safetyStock: number;
};

const CustomPackBuilder = () => {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [inventory, setInventory] = useState<FlavorInventory[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addCustomPack } = useCartStore();

  // Fetch available flavors
  useEffect(() => {
    const fetchFlavors = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        
        // Fetch flavors first - try admin endpoint first, then fallback to public endpoint
        let flavorsResponse;
        try {
          flavorsResponse = await axios.get(`${API_URL}/admin/flavors`, { withCredentials: true });
        } catch {
          // Fallback to public flavors endpoint
          try {
            flavorsResponse = await axios.get(`${API_URL}/products/flavors`, { withCredentials: true });
          } catch {
            // Try the old 3pack endpoint as last resort
            flavorsResponse = await axios.get(`${API_URL}/3pack/admin/flavors`, { withCredentials: true });
          }
        }
        
        // Handle flavors response
        const flavorsData = Array.isArray(flavorsResponse.data) 
          ? flavorsResponse.data 
          : flavorsResponse.data?.flavors || [];
        
        // Filter only active flavors
        const activeFlavors = flavorsData.filter((flavor: Flavor) => flavor.active);
        setFlavors(activeFlavors);

        // Try to fetch inventory data (optional - don't fail if endpoint doesn't exist)
        try {
          const inventoryResponse = await axios.get(`${API_URL}/admin/inventory/alerts`, { withCredentials: true });
          
          // Handle inventory alerts response - map alerts to inventory format
          const alertsData = Array.isArray(inventoryResponse.data)
            ? inventoryResponse.data
            : inventoryResponse.data?.alerts || [];
          
          // Convert alerts to inventory format for easier use
          const inventoryData = alertsData.map((alert: { flavorId: string; onHand?: number; reserved?: number; safetyStock?: number }) => ({
            flavorId: alert.flavorId,
            onHand: alert.onHand || 0,
            reserved: alert.reserved || 0,
            safetyStock: alert.safetyStock || 0
          }));
          
          setInventory(inventoryData);
        } catch (inventoryErr) {
          console.warn("Inventory endpoint not available, continuing without stock data:", inventoryErr);
          // Set empty inventory array so stock checks will default to "in stock"
          setInventory([]);
        }

      } catch (err) {
        console.error("Failed to fetch flavors:", err);
        setError("Failed to load flavors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlavors();
  }, []);

  const getFlavorStock = (flavorId: string) => {
    // If no inventory data available, assume flavors are in stock
    if (inventory.length === 0) {
      return 999; // Show as "in stock" when inventory data is not available
    }
    const flavorInventory = inventory.find(inv => inv.flavorId === flavorId);
    // If no inventory alert exists for this flavor, it means it's in stock
    if (!flavorInventory) {
      return 999; // No alert = in stock
    }
    return flavorInventory.onHand - flavorInventory.reserved;
  };

  const isFlavorInStock = (flavorId: string) => {
    // If no inventory data available, assume flavors are in stock
    if (inventory.length === 0) {
      return true;
    }
    const flavorInventory = inventory.find(inv => inv.flavorId === flavorId);
    // If no inventory alert exists for this flavor, it means it's in stock
    if (!flavorInventory) {
      return true; // No alert = in stock
    }
    return flavorInventory.onHand - flavorInventory.reserved > 0;
  };

  const toggleFlavor = (flavorId: string) => {
    if (selectedFlavors.includes(flavorId)) {
      // Remove flavor
      setSelectedFlavors(prev => prev.filter(id => id !== flavorId));
    } else if (selectedFlavors.length < 3) {
      // Add flavor (only if less than 3 selected)
      setSelectedFlavors(prev => [...prev, flavorId]);
    }
  };

  const removeFlavor = (flavorId: string) => {
    setSelectedFlavors(prev => prev.filter(id => id !== flavorId));
  };

  const addCustomPackToCart = async () => {
    if (selectedFlavors.length !== 3) {
      setError("Please select exactly 3 flavors for your custom pack.");
      return;
    }

    setAddingToCart(true);
    setError(null);

    try {
      // Use the cart store's addCustomPack method
      await addCustomPack(selectedFlavors, 1);

      // Reset selection
      setSelectedFlavors([]);
      
    } catch (err: unknown) {
      console.error("Failed to add custom pack to cart:", err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to add custom pack to cart.";
      setError(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  const selectedFlavorObjects = selectedFlavors.map(id => 
    flavors.find(flavor => flavor.id === id)
  ).filter(Boolean) as Flavor[];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading flavors...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Build Your Custom 3-Pack</h2>
        <p className="text-gray-600">Choose exactly 3 flavors to create your perfect licorice combination</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Selection Counter */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <span className="text-sm font-medium text-gray-700">
            {selectedFlavors.length} of 3 flavors selected
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-2 h-2 rounded-full ${
                  num <= selectedFlavors.length 
                    ? "bg-[#FF5D39]" 
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected Flavors Preview */}
      {selectedFlavorObjects.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Selection:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedFlavorObjects.map((flavor) => (
              <div
                key={flavor.id}
                className="flex items-center gap-2 bg-[#FF5D39] text-white px-3 py-2 rounded-full text-sm font-medium"
              >
                <span>{flavor.name}</span>
                <button
                  onClick={() => removeFlavor(flavor.id)}
                  className="hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flavor Selection Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Flavors:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {flavors.map((flavor) => {
            const isSelected = selectedFlavors.includes(flavor.id);
            const inStock = isFlavorInStock(flavor.id);
            const stockCount = getFlavorStock(flavor.id);
            
            return (
              <FlavorCard
                key={flavor.id}
                flavor={flavor}
                inventory={inventory}
                isSelected={isSelected}
                inStock={inStock}
                stockCount={stockCount}
                onClick={() => toggleFlavor(flavor.id)}
                disabled={selectedFlavors.length >= 3 && !isSelected}
              />
            );
          })}
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="text-center">
        <CustomButton
          title={addingToCart ? "Adding to Cart..." : "Add Custom Pack to Cart"}
          className={`w-full md:w-auto px-8 py-3 font-bold ${
            selectedFlavors.length === 3 
              ? "!bg-[#FF5D39] !text-white hover:opacity-90" 
              : "!bg-gray-300 !text-gray-500 cursor-not-allowed"
          }`}
          onClick={addCustomPackToCart}
          disabled={selectedFlavors.length !== 3 || addingToCart}
        />
        
        {selectedFlavors.length !== 3 && (
          <p className="text-sm text-gray-500 mt-2">
            Select exactly 3 flavors to add to cart
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomPackBuilder;
