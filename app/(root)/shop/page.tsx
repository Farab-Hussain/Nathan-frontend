"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CustomButton from "@/components/custom/CustomButton";
import { useRouter } from "next/navigation";

const ORANGE = "#FF5D39";
const YELLOW = "#F1A900";
const BLACK = "#111111";

// Product data structure matching the backend API
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  stock?: number;
  flavors?: Array<{ name: string; quantity: number }>;
  sku?: string;
};

const ShopPage = () => {
  const router = useRouter();
  const [packages, setPackages] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setPackages(data);
        } else if (data && Array.isArray(data.products)) {
          setPackages(data.products);
        } else if (data && Array.isArray(data.data)) {
          setPackages(data.data);
        } else {
          console.error('Unexpected API response format:', data);
          // Use fallback data instead of throwing error
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError('Request timed out. Please try again.');
          } else {
            setError('Failed to load products. Please try again later.');
          }
        } else {
          setError('Failed to load products. Please try again later.');
        }
        
        // Fallback to static data if API fails
        const fallbackPackages: Product[] = [
          {
            id: "traditional_3_red_twist",
            name: "Traditional - 3 Red Twist",
            description: "A classic combination featuring three traditional red twist licorice ropes. Perfect for those who love the original licorice flavor.",
            price: 27.00,
            category: "Traditional",
            imageUrl: "/assets/images/slider.png",
            isActive: true,
            stock: 50,
            flavors: [
              { name: "Red Twist", quantity: 3 }
            ],
            sku: "3P-TRD-REDx3"
          },
          {
            id: "sour_blue_raspberry_rainbow_green_apple",
            name: "Sour - Blue Raspberry, Fruit Rainbow, Green Apple",
            description: "A tangy sour mix featuring blue raspberry, fruit rainbow, and green apple flavors. Perfect for sour candy lovers!",
            price: 27.00,
            category: "Sour",
            imageUrl: "/assets/images/slider.png",
            isActive: true,
            stock: 45,
            flavors: [
              { name: "Blue Raspberry", quantity: 1 },
              { name: "Fruit Rainbow", quantity: 1 },
              { name: "Green Apple", quantity: 1 }
            ],
            sku: "3P-SOR-BLURAS-FRURAI-GREAPP"
          },
          {
            id: "sour_watermelon_cherry_berry_delight",
            name: "Sour - Watermelon, Cherry, Berry Delight",
            description: "A refreshing sour combination with watermelon, cherry, and berry delight flavors. Sweet and tangy perfection!",
            price: 27.00,
            category: "Sour",
            imageUrl: "/assets/images/slider.png",
            isActive: true,
            stock: 40,
            flavors: [
              { name: "Watermelon", quantity: 1 },
              { name: "Cherry", quantity: 1 },
              { name: "Berry Delight", quantity: 1 }
            ],
            sku: "3P-SOR-WAT-CHE-BERDEL"
          },
          {
            id: "sour_green_apple_blue_raspberry_cherry",
            name: "Sour - Green Apple, Blue Raspberry, Cherry",
            description: "A classic sour trio with green apple, blue raspberry, and cherry flavors. The perfect balance of tart and sweet!",
            price: 27.00,
            category: "Sour",
            imageUrl: "/assets/images/slider.png",
            isActive: true,
            stock: 35,
            flavors: [
              { name: "Green Apple", quantity: 1 },
              { name: "Blue Raspberry", quantity: 1 },
              { name: "Cherry", quantity: 1 }
            ],
            sku: "3P-SOR-GREAPP-BLURAS-CHE"
          },
          {
            id: "sweet_rainbow_cotton_strawberry_banana",
            name: "Sweet - Fruit Rainbow, Cotton Candy, Strawberry Banana",
            description: "A delightful sweet mix featuring fruit rainbow, cotton candy, and strawberry banana flavors. Pure sweetness in every bite!",
            price: 27.00,
            category: "Sweet",
            imageUrl: "/assets/images/slider.png",
            isActive: true,
            stock: 55,
            flavors: [
              { name: "Fruit Rainbow", quantity: 1 },
              { name: "Cotton Candy", quantity: 1 },
              { name: "Strawberry Banana", quantity: 1 }
            ],
            sku: "3P-SWE-FRURAI-COT-STRBAN"
          },
          {
            id: "sweet_watermelon_berry_delight_cherry",
            name: "Sweet - Watermelon, Berry Delight, Cherry",
            description: "A sweet and fruity combination with watermelon, berry delight, and cherry flavors. Perfect for those with a sweet tooth!",
            price: 27.00,
            category: "Sweet",
            imageUrl: "/assets/images/slider.png",
            isActive: true,
            stock: 60,
            flavors: [
              { name: "Watermelon", quantity: 1 },
              { name: "Berry Delight", quantity: 1 },
              { name: "Cherry", quantity: 1 }
            ],
            sku: "3P-SWE-WAT-BERDEL-CHE"
          }
        ];
        setPackages(fallbackPackages);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const viewPackage = (id: string) => router.push(`/products/${id}`);

  if (loading) {
    return (
      <div className="w-full min-h-screen layout py-10 bg-shop-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && packages.length === 0) {
    return (
      <div className="w-full min-h-screen layout py-10 bg-shop-bg">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-6">
            <span className="inline-block text-shop-gradient font-extrabold drop-shadow text-white">
              Shop Packages
            </span>
          </h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Error Loading Products</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-white text-black font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen layout py-10 bg-shop-bg"
      style={{
        color: BLACK,
      }}
    >
      <div className="flex items-center gap-3 mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="inline-block text-shop-gradient font-extrabold drop-shadow text-white">
            Shop Packages
          </span>
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-white text-lg mb-4">
          Choose from our carefully curated licorice rope packages. Each package contains 3 delicious flavors for the perfect tasting experience.
        </p>

      </div>

      {/* Package grid: responsive, elevated cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Array.isArray(packages) && packages.map((pkg) => (
          <div
            key={pkg.id}
            className="group rounded-2xl overflow-hidden bg-white border border-[#FF5D39]/20 hover:border-[#FF5D39] shadow-md hover:shadow-2xl transition-all duration-300 transform-gpu hover:-translate-y-1 h-full"
          >
            <div className="relative">
              <Link href={`/products/${pkg.id}`} className="block">
                {pkg.imageUrl ? (
                  <Image
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    width={640}
                    height={480}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-2xl"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-shop-card rounded-t-2xl" />
                )}
              </Link>
              <span
                className="absolute top-4 left-4 text-sm font-bold px-3 py-1 rounded-full shadow"
                style={{
                  background: pkg.category === "Traditional" ? "#8B4513" : 
                             pkg.category === "Sour" ? "#FF6B35" : 
                             pkg.category === "Sweet" ? "#FF69B4" : YELLOW,
                  color: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                {pkg.category}
              </span>
              <span
                className="absolute top-4 right-4 text-lg font-bold px-3 py-1 rounded-full shadow"
                style={{
                  background: ORANGE,
                  color: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                ${pkg.price.toFixed(2)}
              </span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h3
                  className="font-extrabold text-xl mb-2"
                  style={{ color: BLACK }}
                >
                  {pkg.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {pkg.description}
                </p>
                
                {/* Stock Status */}
                {pkg.stock !== undefined && (
                  <div className="mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      pkg.stock > 20 
                        ? "bg-green-100 text-green-700" 
                        : pkg.stock > 10 
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {pkg.stock > 20 ? "In Stock" : pkg.stock > 10 ? "Low Stock" : "Limited Stock"} ({pkg.stock})
                    </span>
                  </div>
                )}
                
                {/* Flavors */}
                {Array.isArray(pkg.flavors) && pkg.flavors.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-semibold text-xs text-gray-700">Contains:</h4>
                    <div className="space-y-1">
                      {pkg.flavors.slice(0, 3).map((flavor, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          {flavor.name} {flavor.quantity > 1 && `×${flavor.quantity}`}
                        </div>
                      ))}
                      {pkg.flavors.length > 3 && (
                        <div className="text-xs text-gray-500 italic">
                          +{pkg.flavors.length - 3} more flavors
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <CustomButton
                  title="View Details"
                  className="w-full !bg-shop-gradient !text-white font-bold py-3 rounded-lg shadow-lg transition-all hover:opacity-90"
                  onClick={() => viewPackage(pkg.id)}
                />
              </div>
            </div>
          </div>
        ))}
        {!Array.isArray(packages) && (
          <div className="col-span-full text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">No Products Available</h3>
              <p className="text-gray-600 mb-4">Unable to load products at this time.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-all"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 text-center">
        <p className="text-white text-lg mb-6">
          Each package contains 3 carefully selected licorice rope flavors for the perfect tasting experience.
        </p>
        <Link 
          href="/Home" 
          className="inline-block bg-white text-black font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ShopPage;