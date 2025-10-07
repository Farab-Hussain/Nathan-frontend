"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";

type Flavor = {
  id: string;
  name: string;
  aliases: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
  inventory?: {
    id: string;
    flavorId: string;
    onHand: number;
    reserved: number;
    safetyStock: number;
    createdAt: string;
    updatedAt: string;
  };
  _count?: {
    productFlavors: number;
    packRecipeItems: number;
  };
};

type InventoryAlert = {
  id: string;
  flavorId: string;
  flavorName: string;
  currentStock: number;
  minThreshold: number;
  onHand: number;
  reserved: number;
  safetyStock: number;
  flavor?: {
    name: string;
    aliases: string[];
  };
};

type SystemConfig = {
  defaultPrice: number;
  minStockThreshold: number;
  maxFlavorsPerProduct: number;
  supportedCategories: string[];
  totalCategories?: number;
  totalFlavors?: number;
  totalProducts?: number;
  defaultPrices?: { [key: string]: number };
  supportedProductTypes?: string[];
};

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  stock?: number;
  sku?: string;
  flavors?: ProductFlavor[];
  createdAt?: string;
  updatedAt?: string;
};

type FlavorDTO = {
  id: string;
  name?: string | null;
  quantity?: number | null;
};

type ProductFlavor = {
  id: string;
  name: string;
  quantity: number;
};

const AdminPageContent = () => {
  const { user, loading: userLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "products" | "flavors" | "inventory" | "config"
  >("products");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced image compression function with progressive quality reduction
  const compressImage = (
    file: File,
    targetSizeMB: number = 5
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      const img = new window.Image();

      img.onload = () => {
        // Calculate new dimensions (max 1200px width, maintain aspect ratio)
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress with progressive quality reduction
        ctx?.drawImage(img, 0, 0, width, height);

        const compressWithQuality = (quality: number): Promise<File> => {
          return new Promise((resolveQuality) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const sizeMB = blob.size / (1024 * 1024);
                  if (sizeMB <= targetSizeMB || quality <= 0.3) {
                    // Accept if within target size or quality is already very low
                    const compressedFile = new File([blob], file.name, {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    });
                    resolveQuality(compressedFile);
                  } else {
                    // Try with lower quality
                    compressWithQuality(quality - 0.1).then(resolveQuality);
                  }
                } else {
                  resolveQuality(file);
                }
              },
              "image/jpeg",
              quality
            );
          });
        };

        // Start with 80% quality and reduce if needed
        compressWithQuality(0.8).then(resolve);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // File size validation function
  const validateFileSize = (file: File, maxSizeMB: number = 50): boolean => {
    const sizeMB = file.size / (1024 * 1024);
    return sizeMB <= maxSizeMB;
  };

  // Flavors state
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [editingFlavor, setEditingFlavor] = useState<string | null>(null);
  const [editFlavorData, setEditFlavorData] = useState({
    name: "",
    aliases: "",
    active: true,
  });
  const [editFlavorImageFile, setEditFlavorImageFile] = useState<File | null>(
    null
  );
  const [editFlavorImagePreview, setEditFlavorImagePreview] = useState<
    string | null
  >(null);

  const [bulkImageUrl, setBulkImageUrl] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Bulk update flavor images
  const bulkUpdateFlavorImages = async () => {
    if (!bulkImageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setBulkUpdating(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const flavorIds = flavors.map((flavor) => flavor.id);

      const { data } = await axios.put(
        `${API_URL}/admin/flavors/bulk-update-images`,
        {
          flavorIds: flavorIds,
          imageUrl: bulkImageUrl.trim(),
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh flavors to show updated images
      await fetchFlavors();

      setBulkImageUrl("");
      setError(null);

      // Show success message
      alert(
        `Successfully updated ${data.updatedCount} flavors with the new image!`
      );
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update flavor images";
      setError(errorMessage);
    } finally {
      setBulkUpdating(false);
    }
  };

  // Helper function to normalize image src with cache busting
  const normalizeImageSrc = (src?: string | null, updatedAt?: string) => {
    if (!src) return "/assets/images/slider.png";

    // Handle static assets (served from frontend)
    if (src.startsWith("/assets")) {
      const cacheBuster = updatedAt
        ? `?t=${new Date(updatedAt).getTime()}`
        : `?t=${Date.now()}`;
      return `${src}${cacheBuster}`;
    }

    // Handle uploaded images (served from backend)
    if (src.startsWith("/uploads") || src.startsWith("uploads")) {
      const path = src.startsWith("/uploads") ? src : `/${src}`;
      const cacheBuster = updatedAt
        ? `?t=${new Date(updatedAt).getTime()}`
        : `?t=${Date.now()}`;

      // Always use the full API URL for uploaded images
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL is not defined");
        return `${path}${cacheBuster}`;
      }
      return `${apiUrl}${path}${cacheBuster}`;
    }

    // Handle full URLs (already complete)
    if (src.startsWith("http://") || src.startsWith("https://")) {
      const cacheBuster = updatedAt
        ? `?t=${new Date(updatedAt).getTime()}`
        : `?t=${Date.now()}`;
      return `${src}${cacheBuster}`;
    }

    // Default case - assume it needs API URL
    const cacheBuster = updatedAt
      ? `?t=${new Date(updatedAt).getTime()}`
      : `?t=${Date.now()}`;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return `${src}${cacheBuster}`;
    }

    // Ensure src starts with / for proper path construction
    const normalizedSrc = src.startsWith("/") ? src : `/${src}`;
    return `${apiUrl}${normalizedSrc}${cacheBuster}`;
  };

  // Categories state - removed unused variables

  // Inventory state
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [updatingInventory, setUpdatingInventory] = useState<{
    [key: string]: boolean;
  }>({});

  // Config state
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    price: 0,
    stock: 0,
    category: "",
    isActive: true,
    sku: "",
    flavors: [],
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [availableFlavors, setAvailableFlavors] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [newFlavor, setNewFlavor] = useState({
    name: "",
    aliases: "",
  });
  const [flavorImageFile, setFlavorImageFile] = useState<File | null>(null);
  const [flavorImagePreview, setFlavorImagePreview] = useState<string | null>(
    null
  );
  const [creatingFlavor, setCreatingFlavor] = useState<boolean>(false);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, userLoading, router]);

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["products", "flavors", "inventory", "config"].includes(
        tabParam
      )
    ) {
      setActiveTab(
        tabParam as
          | "products"
          | "flavors"
          | "inventory"
          | "config"
      );
    }
  }, [searchParams]);

  // Helper functions for products
  const getFlavorNameById = (id: string): string => {
    const found = availableFlavors.find((f) => f.id === id);
    return found ? found.name : id;
  };

  const formatFlavors = (flavors?: Array<FlavorDTO>): string => {
    if (!Array.isArray(flavors) || flavors.length === 0) return "-";
    return flavors
      .map((f) => {
        const name =
          f.name && String(f.name).trim() !== ""
            ? String(f.name)
            : getFlavorNameById(String(f.id));
        const qtyRaw =
          typeof f.quantity === "number" ? f.quantity : Number(f.quantity || 1);
        const quantity =
          Number.isFinite(qtyRaw) && qtyRaw > 0 ? Number(qtyRaw) : 1;
        return `${name} (${quantity})`;
      })
      .join(", ");
  };

  // Extract/normalize flavors from various backend shapes
  type UnknownFlavor = {
    id?: string;
    name?: string;
    flavor?: string;
    quantity?: number;
    qty?: number;
  };
  const extractFlavors = (raw: unknown): FlavorDTO[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      // Could be string[] or object[]
      if (raw.length === 0) return [];
      if (typeof raw[0] === "string") {
        return (raw as string[]).map((name, idx) => ({
          id: String(idx),
          name,
          quantity: 1,
        }));
      }
      return (raw as Array<UnknownFlavor>).map((f, idx) => ({
        id: String(f?.id ?? idx),
        name:
          typeof f?.name === "string" && f.name
            ? f.name
            : typeof f?.flavor === "string"
            ? f.flavor
            : undefined,
        quantity:
          typeof f?.quantity === "number" ? f.quantity : Number(f?.qty ?? 1),
      }));
    }
    if (typeof raw === "string") {
      const str = raw.trim();
      // Try JSON first
      try {
        const parsed = JSON.parse(str);
        return extractFlavors(parsed);
      } catch {}
      // Fallback: comma-separated names
      return str
        .split(",")
        .map((s, idx) => ({ id: String(idx), name: s.trim(), quantity: 1 }));
    }
    // Unknown shape
    return [];
  };

  const normalizeFlavorsForSave = (
    flavors?: Array<FlavorDTO | ProductFlavor>
  ): ProductFlavor[] => {
    if (!Array.isArray(flavors)) return [];
    return flavors.map((f) => {
      const id = String((f as FlavorDTO).id);
      const name =
        (f as FlavorDTO).name && String((f as FlavorDTO).name).trim() !== ""
          ? String((f as FlavorDTO).name)
          : getFlavorNameById(id);
      const qtyRaw = (f as FlavorDTO).quantity;
      const quantity =
        typeof qtyRaw === "number" ? qtyRaw : Number(qtyRaw || 1);
      return {
        id,
        name,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      };
    });
  };

  const fetchFlavors = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get(
        `${API_URL}/admin/flavors?_t=${Date.now()}`,
        {
          withCredentials: true,
        }
      );
      // Handle both array format and object with flavors property
      if (Array.isArray(data)) {
        setFlavors(data);
      } else if (data && Array.isArray(data.flavors)) {
        setFlavors(data.flavors);
      } else {
        console.warn("Flavors API returned unexpected data format:", data);
        setFlavors([]);
      }
    } catch (err) {
      console.error("Failed to fetch flavors:", err);

      // Check if it's an authentication error
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        const errorData = err.response.data;
        if (errorData?.code === "NO_TOKEN") {
          // Show the authentication error message to user
          setError(
            errorData.message ||
              "Authentication required. Please log in to access this resource."
          );
          // Redirect to login page after a short delay to show the message
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 2000);
          return;
        }
      }

      // If the new admin endpoint doesn't exist yet, try the old one
      try {
        const { data } = await axios.get(
          `${API_URL}/3pack/admin/flavors?_t=${Date.now()}`,
          {
            withCredentials: true,
          }
        );
        if (Array.isArray(data)) {
          setFlavors(data);
        } else if (data && Array.isArray(data.flavors)) {
          setFlavors(data.flavors);
        } else {
          setFlavors([]);
        }
      } catch (fallbackErr) {
        console.error("Fallback flavors fetch also failed:", fallbackErr);
        setFlavors([]);
        // Show user-friendly error message
        if (
          axios.isAxiosError(fallbackErr) &&
          fallbackErr.response?.data?.message
        ) {
          setError(fallbackErr.response.data.message);
        } else {
          setError("Failed to load flavors. Please try again.");
        }
      }
    }
  };


  const fetchInventoryAlerts = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get(
        `${API_URL}/admin/inventory/alerts?_t=${Date.now()}`,
        {
          withCredentials: true,
        }
      );
      // Handle both array format and object with alerts property
      if (Array.isArray(data)) {
        setInventoryAlerts(data);
      } else if (data && Array.isArray(data.alerts)) {
        setInventoryAlerts(data.alerts);
      } else {
        console.warn(
          "Inventory alerts API returned unexpected data format:",
          data
        );
        setInventoryAlerts([]);
      }
    } catch (err) {
      console.error("Failed to fetch inventory alerts:", err);

      // Check if it's an authentication error
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        const errorData = err.response.data;
        if (errorData?.code === "NO_TOKEN") {
          // Show the authentication error message to user
          setError(
            errorData.message ||
              "Authentication required. Please log in to access this resource."
          );
          // Redirect to login page after a short delay to show the message
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 2000);
          return;
        }
      }

      setInventoryAlerts([]);
    }
  };

  const fetchSystemConfig = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get(
        `${API_URL}/admin/config?_t=${Date.now()}`,
        {
          withCredentials: true,
        }
      );
      // Handle both direct config object and wrapped response
      const configData = data.config || data;
      setSystemConfig(configData);
    } catch (err) {
      console.error("Failed to fetch system config:", err);

      // Check if it's an authentication error
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        const errorData = err.response.data;
        if (errorData?.code === "NO_TOKEN") {
          // Show the authentication error message to user
          setError(
            errorData.message ||
              "Authentication required. Please log in to access this resource."
          );
          // Redirect to login page after a short delay to show the message
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 2000);
          return;
        }
      }

      setSystemConfig(null);
    }
  };

  // Product-related functions
  const fetchProducts = useCallback(async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      const q = String(search || "").trim();
      if (q) params.set("search", q);
      const cat = String(categoryFilter || "").trim();
      if (cat) params.set("category", cat);

      const { data } = await axios.get<{
        products: Product[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(`${API_URL}/products/admin/all?${params.toString()}`, {
        withCredentials: true,
      });
      setProducts(Array.isArray(data.products) ? data.products : []);
      setPagination(data.pagination || null);
    } catch (e) {
      // Fallback: try alternate mount
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        try {
          const params = new URLSearchParams();
          params.set("page", String(page));
          params.set("limit", String(limit));
          const q = String(search || "").trim();
          if (q) params.set("search", q);
          const cat = String(categoryFilter || "").trim();
          if (cat) params.set("category", cat);
          const { data } = await axios.get<{
            products: Product[];
            pagination?: {
              page: number;
              limit: number;
              total: number;
              pages: number;
            };
          }>(`${API_URL}/admin/all?${params.toString()}`, {
            withCredentials: true,
          });
          setProducts(Array.isArray(data.products) ? data.products : []);
          setPagination(data.pagination || null);
          setError(null);
        } catch (e2) {
          const message =
            (e2 as { message?: string })?.message ||
            "Unable to load products. Please try again.";
          setError(message);
          setProducts([]);
          setPagination(null);
        }
      } else {
        const message =
          (e as { message?: string })?.message ||
          "Unable to load products. Please try again.";
        setError(message);
        setProducts([]);
        setPagination(null);
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryFilter]);

  const fetchProductCategories = useCallback(async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const { data } = await axios.get<string[]>(
        `${API_URL}/products/categories`,
        { withCredentials: true }
      );
      if (Array.isArray(data)) setProductCategories(data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        try {
          const { data } = await axios.get<string[]>(
            `${API_URL}/products/categories`,
            { withCredentials: true }
          );
          if (Array.isArray(data)) setProductCategories(data);
        } catch (e2) {
          if (axios.isAxiosError(e2) && e2.response?.status === 404) {
            try {
              const { data } = await axios.get<string[]>(
                `${API_URL}/products/categories`,
                { withCredentials: true }
              );
              if (Array.isArray(data)) setProductCategories(data);
            } catch {
              /* ignore */
            }
          }
        }
      }
    }
  }, []);

  const fetchAvailableFlavors = useCallback(async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      // Try new admin endpoint first
      const { data } = await axios.get(`${API_URL}/admin/flavors`, {
        withCredentials: true,
      });
      // Handle both array format and object with flavors property
      const flavorsArray = Array.isArray(data) ? data : data?.flavors || [];
      // Filter only active flavors and map to the expected format
      const activeFlavors = flavorsArray
        .filter((flavor: { active: boolean }) => flavor.active)
        .map((flavor: { id: string; name: string }) => ({
          id: flavor.id,
          name: flavor.name,
        }));
      setAvailableFlavors(activeFlavors);
    } catch {
      // Fallback to old endpoint
      try {
        const { data } = await axios.get(`${API_URL}/3pack/admin/flavors`, {
          withCredentials: true,
        });
        const flavorsArray = Array.isArray(data) ? data : data?.flavors || [];
        const activeFlavors = flavorsArray
          .filter((flavor: { active: boolean }) => flavor.active)
          .map((flavor: { id: string; name: string }) => ({
            id: flavor.id,
            name: flavor.name,
          }));
        setAvailableFlavors(activeFlavors);
      } catch (e2) {
        console.error("Failed to load flavors:", e2);
        setAvailableFlavors([]);
      }
    }
  }, []);

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

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", newFlavor.name.trim());
      formData.append("aliases", JSON.stringify(aliasesArray));
      formData.append("active", "true");

      if (flavorImageFile) {
        formData.append("flavorImage", flavorImageFile);
      }

      const { data } = await axios.post(`${API_URL}/admin/flavors`, formData, {
        withCredentials: true,
        // Don't set Content-Type manually - let axios handle it for FormData
      });

      // Handle response format - could be direct object or wrapped in response
      const flavorData = data.flavor || data;

      setFlavors((prev) => [...prev, flavorData]);
      setAvailableFlavors((prev) => [
        ...prev,
        { id: flavorData.id, name: flavorData.name },
      ]);
      setNewFlavor({ name: "", aliases: "" });
      setFlavorImageFile(null);
      setFlavorImagePreview(null);

      // Refresh the flavors list to ensure consistency
      await fetchFlavors();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create flavor";
      setError(errorMessage);
    } finally {
      setCreatingFlavor(false);
    }
  };

  const deleteFlavor = async (flavorId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this flavor? This action cannot be undone and will affect any products using this flavor."
      )
    ) {
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setError(null);
    try {
      await axios.delete(`${API_URL}/admin/flavors/${flavorId}`, {
        withCredentials: true,
      });

      // Remove the flavor from the flavors list
      setFlavors((prev) => prev.filter((f) => f.id !== flavorId));
      
      // Remove the flavor from available flavors
      setAvailableFlavors((prev) => prev.filter((f) => f.id !== flavorId));
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete flavor";
      setError(errorMessage);
    }
  };

  const updateFlavorAdmin = async (id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setError(null);
    try {
      // Validate file size before upload
      if (editFlavorImageFile && !validateFileSize(editFlavorImageFile, 50)) {
        setError(
          "Image file is too large. Please compress the image and try again."
        );
        return;
      }

      const aliasesArray = editFlavorData.aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter((alias) => alias.length > 0);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", editFlavorData.name.trim());
      formData.append("aliases", JSON.stringify(aliasesArray));
      formData.append("active", editFlavorData.active.toString());

      if (editFlavorImageFile) {
        formData.append("flavorImage", editFlavorImageFile);
      }

      const { data } = await axios.put(
        `${API_URL}/admin/flavors/${id}`,
        formData,
        {
          withCredentials: true,
          // Don't set Content-Type manually - let axios handle it for FormData
        }
      );

      // Update the flavor in state with fresh data
      const updatedFlavor = data.flavor || data;
      setFlavors((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...updatedFlavor, updatedAt: new Date().toISOString() }
            : f
        )
      );

      setEditingFlavor(null);
      setEditFlavorImageFile(null);
      setEditFlavorImagePreview(null);

      // Refresh the flavors list to ensure consistency
      await fetchFlavors();
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            code?: string;
            maxSize?: string;
          };
        };
      };

      if (errorResponse?.response?.status === 413) {
        setError(
          "File too large. Please compress your image and try again. Maximum size is 50MB."
        );
      } else {
        const errorMessage =
          errorResponse?.response?.data?.message || "Failed to update flavor";
        setError(errorMessage);
      }
    }
  };

  // Product management functions
  const resetForm = () =>
    setForm({
      name: "",
      price: 0,
      category: "",
      description: "",
      imageUrl: "",
      sku: "",
      flavors: [],
    });

  const addFlavor = () => {
    if (form.flavors && form.flavors.length < 3) {
      setForm((prev) => ({
        ...prev,
        flavors: [...(prev.flavors || []), { id: "", name: "", quantity: 1 }],
      }));
    }
  };

  const removeFlavor = (index: number) => {
    setForm((prev) => ({
      ...prev,
      flavors: prev.flavors?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateFlavor = (
    index: number,
    field: keyof ProductFlavor,
    value: string | number
  ) => {
    setForm((prev) => {
      const nextFlavors = [...(prev.flavors || [])];
      const current = nextFlavors[index] || { id: "", name: "", quantity: 1 };
      if (field === "id") {
        const selected = availableFlavors.find((f) => f.id === value);
        nextFlavors[index] = {
          ...current,
          id: String(value || ""),
          name: selected?.name || current.name || "",
        };
      } else {
        nextFlavors[index] = { ...current, [field]: value } as ProductFlavor;
      }
      return { ...prev, flavors: nextFlavors };
    });
  };

  const createProduct = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", String(form.name || ""));
      fd.append("price", String(Number(form.price || 0)));
      fd.append("stock", String(Number(form.stock || 0)));
      fd.append("category", String(form.category || ""));
      if (form.description) fd.append("description", form.description);
      fd.append("isActive", String(!!form.isActive));
      if (form.sku) fd.append("sku", form.sku);
      if (Array.isArray(form.flavors)) {
        fd.append(
          "flavors",
          JSON.stringify(normalizeFlavorsForSave(form.flavors))
        );
      }
      if (imageFile) fd.append("productImage", imageFile);
      if (!imageFile && form.imageUrl) fd.append("imageUrl", form.imageUrl);

      const { data: dataResp } = await axios.post<Product>(
        `${API_URL}/products/admin/products`,
        fd,
        {
          withCredentials: true,
        }
      );
      const data = dataResp as Product;
      setProducts((prev) => [data, ...prev]);
      resetForm();
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(null);
      setImageFile(null);
    } catch (e) {
      const message =
        (e as { message?: string })?.message ||
        "Unable to create product. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const updateProductByRow = async (
    row: Product,
    overrides: Partial<Product>
  ) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setSaving(true);
    setError(null);
    try {
      const id = row.id;
      if (!id) {
        setError("Missing product id");
        setSaving(false);
        return;
      }
      const payload = {
        name: overrides.name ?? row.name,
        price: Number(overrides.price ?? row.price ?? 0),
        stock: Number(overrides.stock ?? row.stock ?? 0),
        category: overrides.category ?? row.category,
        description: overrides.description ?? row.description,
        imageUrl: overrides.imageUrl ?? row.imageUrl,
        imageBase64:
          (overrides as { imageBase64?: string }).imageBase64 || undefined,
        isActive: overrides.isActive ?? row.isActive ?? true,
        sku: overrides.sku ?? row.sku,
        flavors: normalizeFlavorsForSave(overrides.flavors ?? row.flavors),
      };

      // Optimistic update
      const prev = products;
      setProducts((cur) =>
        cur.map((p) => (p.id === id ? { ...p, ...payload } : p))
      );

      let dataResp: Product;
      try {
        // Primary route
        const { data } = await axios.put<Product>(
          `${API_URL}/products/admin/${id}`,
          payload,
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        dataResp = data;
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          // Fallback legacy mount
          const { data } = await axios.put<Product>(
            `${API_URL}/products/admin/products/${id}`,
            payload,
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );
          dataResp = data;
        } else {
          // Revert optimistic update
          setProducts(prev);
          throw e;
        }
      }
      const updated = dataResp as Product;
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
    } catch (e) {
      const message =
        (e as { message?: string })?.message || "Failed to update product";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setDeleting((prev) => ({ ...prev, [id]: true }));
    setError(null);
    try {
      try {
        // Primary route (mirrors updateProduct primary)
        await axios.delete(`${API_URL}/products/admin/${id}`, {
          withCredentials: true,
        });
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          // Fallback legacy mount
          await axios.delete(`${API_URL}/products/admin/products/${id}`, {
            withCredentials: true,
          });
        } else {
          throw e;
        }
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      const message =
        (e as { message?: string })?.message ||
        "Unable to delete product. Please try again.";
      setError(message);
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
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
      await fetchFlavors(); // Refresh flavors with updated inventory data
    } catch {
      setError("Failed to update inventory");
    } finally {
      setUpdatingInventory((prev) => ({ ...prev, [flavorId]: false }));
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, pagination?.pages || 1),
    [pagination?.pages]
  );

  const fetchData = useCallback(async () => {
    if (!user || user.role !== "admin") {
      return; // Don't fetch data if user is not authenticated as admin
    }

    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case "products":
          await fetchProducts();
          await fetchProductCategories();
          await fetchAvailableFlavors();
          break;
        case "flavors":
          await fetchFlavors();
          break;
        case "inventory":
          await fetchInventoryAlerts();
          break;
        case "config":
          await fetchSystemConfig();
          break;
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    fetchProducts,
    fetchProductCategories,
    fetchAvailableFlavors,
    user,
  ]);

  // Main data fetching effect
  useEffect(() => {
    if (!userLoading && user && user.role === "admin") {
      fetchData();
      if (activeTab === "products") {
        fetchProducts();
        fetchProductCategories();
        fetchAvailableFlavors();
      }
    }
  }, [
    user,
    userLoading,
    activeTab,
    fetchData,
    fetchProducts,
    fetchProductCategories,
    fetchAvailableFlavors,
  ]);

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

  // Redirect if user is not authenticated or not admin
  if (!userLoading && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full layout">
      <h1 className="text-3xl font-extrabold text-black mb-6">AddProduct</h1>

      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "products", label: "Products" },
          { id: "flavors", label: "Flavors" },
          { id: "inventory", label: "Inventory" },
          { id: "config", label: "System Config" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(
                tab.id as
                  | "products"
                  | "flavors"
                  | "inventory"
                  | "config"
              )
            }
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

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Create / Edit form */}
          <div className="rounded-2xl border shadow bg-white p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-black">
                {openId ? "Edit product" : "Add new product"}
              </h2>
              {openId && (
                <button
                  onClick={() => {
                    setOpenId(null);
                    resetForm();
                  }}
                  className="text-sm text-black underline cursor-pointer"
                >
                  Cancel edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="text-sm font-semibold text-black/80 mb-2">
                    Product details
                  </div>
                  <div className="h-px w-full bg-gray-200 mb-3" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black/70">Name</label>
                  <input
                    className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                    placeholder="Product name"
                    value={form.name || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-black/70">Price</label>
                  <input
                    className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                    placeholder="0.00"
                    type="number"
                    value={form.price || 0}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black/70">Stock</label>
                    <input
                      className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                      placeholder="0"
                      type="number"
                      value={form.stock || 0}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          stock: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-black/70">SKU</label>
                    <input
                      className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                      placeholder="e.g., 3P-SWE-WAT-BERRY-CHE"
                      value={form.sku || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sku: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-sm text-black/70">Category</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                      value={form.category || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                    >
                      <option value="">Select category</option>
                      {productCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                      placeholder="Or type new category"
                      value={form.category || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-sm text-black/70">Description</label>
                  <textarea
                    className="border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                    rows={3}
                    placeholder="Optional description"
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-black/70">
                      Flavors (Max 3)
                    </label>
                    <button
                      type="button"
                      onClick={addFlavor}
                      disabled={(form.flavors?.length || 0) >= 3}
                      className="text-sm text-[#FF5D39] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Add Flavor
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.flavors?.map((flavor, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-8 sm:col-span-9">
                          <select
                            className="w-full border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                            value={flavor.id}
                            onChange={(e) => {
                              if (e.target.value === "add_new") {
                                // Redirect to Flavors tab instead of opening form
                                setActiveTab("flavors");
                              } else {
                                updateFlavor(index, "id", e.target.value);
                              }
                            }}
                          >
                            <option value="">Select flavor</option>
                            {availableFlavors.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                            <option
                              value="add_new"
                              className="text-[#FF5D39] font-semibold"
                              disabled
                            >
                              + Add New Flavor (Use Flavors Tab)
                            </option>
                          </select>
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                          <input
                            type="number"
                            min="1"
                            max="3"
                            className="w-full border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF5D39]"
                            placeholder="Qty"
                            value={flavor.quantity}
                            onChange={(e) =>
                              updateFlavor(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => removeFlavor(index)}
                            className="px-2 py-2 text-red-500 hover:text-red-700 cursor-pointer"
                            aria-label="Remove flavor"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!form.flavors || form.flavors.length === 0) && (
                      <div className="text-sm text-gray-500 italic">
                        No flavors added. Click &quot;Add Flavor&quot; to add up
                        to 3 flavors.
                      </div>
                    )}
                  </div>

                  {/* Note: Flavor management moved to dedicated Flavors tab */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> To add new flavors or manage existing ones, please use the <strong>Flavors</strong> tab above.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="rounded-xl border bg-white p-3 flex flex-col items-center justify-center">
                  <div className="text-sm text-black/70 mb-2">Preview</div>
                  {(() => {
                    if (preview) {
                      return (
                        <Image
                          width={240}
                          height={180}
                          src={preview}
                          alt={form.name || "preview"}
                          className="w-full max-w-[260px] aspect-[4/3] object-cover rounded"
                        />
                      );
                    }
                    if (form.imageUrl) {
                      return (
                        <Image
                          src={normalizeImageSrc(form.imageUrl)}
                          alt={form.name || "preview"}
                          width={240}
                          height={180}
                          className="w-full max-w-[260px] aspect-[4/3] object-cover rounded"
                        />
                      );
                    }
                    return (
                      <div className="w-full max-w-[260px] aspect-[4/3] bg-gray-100 rounded" />
                    );
                  })()}
                </div>
                <div className="mt-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        setImageFile(file);
                        const blobUrl = URL.createObjectURL(file);
                        setPreview(blobUrl);
                        setForm((f) => ({ ...f, imageUrl: "" }));
                      } else {
                        if (preview?.startsWith("blob:"))
                          URL.revokeObjectURL(preview);
                        setPreview(null);
                        setImageFile(null);
                      }
                    }}
                    className="block text-black text-sm"
                  />
                </div>
                <label className="mt-4 flex items-center gap-2 text-black">
                  <input
                    type="checkbox"
                    checked={!!form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 justify-end">
              <button
                disabled={
                  saving ||
                  !form.name ||
                  !form.category ||
                  !form.sku ||
                  Number(form.price || 0) <= 0 ||
                  !form.flavors ||
                  form.flavors.length === 0 ||
                  !!openId
                }
                onClick={createProduct}
                className="px-4 py-2 rounded bg-[#FF5D39] text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Add product"}
              </button>
              <button
                disabled={
                  saving ||
                  !openId ||
                  !form.name ||
                  !form.category ||
                  Number(form.price || 0) <= 0
                }
                onClick={() => {
                  if (!openId) return;
                  const row = products.find((p) => p.id === openId);
                  if (!row) return;
                  // Build overrides without empty-string fields to avoid clearing data
                  const overrides: Partial<Product> = {
                    name: form.name || undefined,
                    category: form.category || undefined,
                    price:
                      typeof form.price === "number"
                        ? form.price
                        : Number(form.price || 0),
                    stock:
                      typeof form.stock === "number"
                        ? form.stock
                        : Number(form.stock || 0),
                    description:
                      form.description && form.description.trim() !== ""
                        ? form.description
                        : undefined,
                    sku:
                      form.sku && form.sku.trim() !== "" ? form.sku : undefined,
                    isActive:
                      typeof form.isActive === "boolean"
                        ? form.isActive
                        : row.isActive,
                    flavors:
                      form.flavors && form.flavors.length > 0
                        ? form.flavors
                        : undefined,
                    // Do not pass imageUrl here unless explicitly set to avoid wiping existing image
                    imageUrl:
                      form.imageUrl && form.imageUrl.trim() !== ""
                        ? form.imageUrl
                        : undefined,
                  };
                  updateProductByRow(row, overrides);
                }}
                className="px-4 py-2 rounded bg-[#F1A900] text-black cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                disabled={saving}
                onClick={resetForm}
                className="px-4 py-2 rounded border border-gray-300 text-black bg-white hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
            <input
              className="border rounded px-3 py-2 bg-white text-black w-full md:w-auto"
              placeholder="Search products by name"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <select
              className="border rounded px-3 py-2 bg-white text-black"
              value={categoryFilter}
              onChange={(e) => {
                setPage(1);
                setCategoryFilter(e.target.value);
              }}
            >
              <option value="">All categories</option>
              {productCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-2 bg-white text-black"
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(parseInt(e.target.value) || 10);
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Products table */}
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 sticky top-0  z-20">
                <tr>
                  <th className="px-4 py-2 text-black">Image</th>
                  <th className="px-4 py-2 text-black">Name</th>
                  <th className="px-4 py-2 text-black">Price</th>
                  <th className="px-4 py-2 text-black">Category</th>
                  <th className="px-4 py-2 text-black">SKU</th>
                  <th className="px-4 py-2 text-black">Stock</th>
                  <th className="px-4 py-2 text-black">Flavors</th>
                  <th className="px-4 py-2 text-black">Active</th>
                  <th className="px-4 py-2 text-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p, idx) => {
                  // Use only 'id' for Product type, remove reference to '_id'
                  const pid = p.id || "";
                  return (
                    <tr
                      key={pid || idx}
                      className={
                        idx % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50 hover:bg-gray-100"
                      }
                    >
                      <td className="px-4 py-2">
                        {p.imageUrl ? (
                          <Image
                            src={normalizeImageSrc(p.imageUrl, p.updatedAt)}
                            alt={p.name}
                            width={64}
                            height={48}
                            className="w-16 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-12 rounded bg-gray-100 border" />
                        )}
                      </td>
                      <td className="px-4 py-2 text-black">{p.name}</td>
                      <td className="px-4 py-2 text-black">
                        ${Number(p.price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-black">{p.category}</td>
                      <td className="px-4 py-2 text-black text-sm">
                        {p.sku || "-"}
                      </td>
                      <td className="px-4 py-2 text-black">{p.stock || 0}</td>
                      <td className="px-4 py-2 text-black text-sm">
                        {formatFlavors(
                          extractFlavors(
                            (p as unknown as { flavors?: unknown }).flavors ??
                              (p as unknown as { flavours?: unknown })
                                .flavours ??
                              (p as unknown as { flavor?: unknown }).flavor ??
                              (p as unknown as { options?: unknown }).options
                          )
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            p.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 rounded border text-white hover:opacity-90 bg-secondary cursor-pointer"
                            onClick={() => {
                              setOpenId(pid);
                              setForm(p);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 rounded border text-white hover:opacity-90 bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={deleting[pid]}
                            onClick={() => deleteProduct(pid)}
                          >
                            {deleting[pid] ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Deleting...
                              </div>
                            ) : (
                              "Delete"
                            )}
                          </button>
                          <button
                            className="px-3 py-1 rounded border bg-secondary cursor-pointer"
                            onClick={() =>
                              updateProductByRow(p as Product, {
                                isActive: !p.isActive,
                              })
                            }
                          >
                            {p.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded border text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <span className="text-black">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-3 py-1 rounded border text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
          {loading && <div className="mt-4 text-black">Loading...</div>}
        </div>
      )}

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
                    placeholder="e.g., chocolate, mint, cocoa"
                  />
                </div>
              </div>

              {/* Flavor Image Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flavor Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Compress image if it's larger than 2MB
                          let processedFile = file;
                          if (file.size > 2 * 1024 * 1024) {
                            processedFile = await compressImage(file);
                          }
                          setFlavorImageFile(processedFile);
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setFlavorImagePreview(e.target?.result as string);
                          };
                          reader.readAsDataURL(processedFile);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF5D39] file:text-white hover:file:bg-opacity-90"
                    />
                  </div>
                  {flavorImagePreview && (
                    <div className="flex-shrink-0">
                      <Image
                        src={flavorImagePreview}
                        alt="Flavor preview"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
                {flavorImageFile && (
                  <button
                    onClick={() => {
                      setFlavorImageFile(null);
                      setFlavorImagePreview(null);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove image
                  </button>
                )}
              </div>
              <button
                onClick={createFlavor}
                disabled={creatingFlavor || !newFlavor.name.trim()}
                className="mt-3 bg-[#FF5D39] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingFlavor ? "Creating..." : "Create Flavor"}
              </button>
            </div>

            {/* Bulk Image Update Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bulk Update Flavor Images
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL for All Flavors
                  </label>
                  <input
                    type="text"
                    value={bulkImageUrl}
                    onChange={(e) => setBulkImageUrl(e.target.value)}
                    placeholder="Enter image URL (e.g., /uploads/flavors/flavorImage-123.png)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={bulkUpdateFlavorImages}
                    disabled={bulkUpdating || !bulkImageUrl.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkUpdating ? "Updating..." : "Update All Flavors"}
                  </button>
                  <span className="text-sm text-gray-600">
                    This will update all {flavors.length} flavors with the same
                    image
                  </span>
                </div>
                {bulkImageUrl && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview:
                    </label>
                    <Image
                      width={96}
                      height={96}
                      src={normalizeImageSrc(bulkImageUrl)}
                      alt="Bulk image preview"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
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
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Flavor Name
                            </label>
                            <input
                              type="text"
                              value={editFlavorData.name}
                              onChange={(e) =>
                                setEditFlavorData({
                                  ...editFlavorData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Aliases (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={editFlavorData.aliases}
                              onChange={(e) =>
                                setEditFlavorData({
                                  ...editFlavorData,
                                  aliases: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white"
                              placeholder="Aliases (comma-separated)"
                            />
                          </div>
                        </div>

                        {/* Image Upload for Edit */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update Flavor Image
                          </label>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // Validate file size first
                                    if (!validateFileSize(file, 50)) {
                                      setError(
                                        "File size too large. Please select an image smaller than 50MB."
                                      );
                                      e.target.value = ""; // Clear the input
                                      return;
                                    }

                                    try {
                                      // Always compress images for optimal upload performance
                                      let processedFile = file;
                                      if (file.size > 1 * 1024 * 1024) {
                                        // Compress if larger than 1MB
                                        processedFile = await compressImage(
                                          file,
                                          5
                                        ); // Target 5MB max
                                      }

                                      setEditFlavorImageFile(processedFile);
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        setEditFlavorImagePreview(
                                          e.target?.result as string
                                        );
                                      };
                                      reader.readAsDataURL(processedFile);
                                      setError(null); // Clear any previous errors
                                    } catch (processingError) {
                                      console.error(
                                        "Image processing error:",
                                        processingError
                                      );
                                      setError(
                                        "Failed to process image. Please try a different file."
                                      );
                                      e.target.value = ""; // Clear the input
                                    }
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5D39] text-black bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF5D39] file:text-white hover:file:bg-opacity-90"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Maximum file size: 50MB. Images larger than 1MB
                                will be automatically compressed.
                              </p>
                            </div>
                            {/* Current Image */}
                            {flavor.imageUrl && !editFlavorImagePreview && (
                              <div className="flex-shrink-0">
                                <Image
                                  width={64}
                                  height={64}
                                  src={normalizeImageSrc(
                                    flavor.imageUrl,
                                    flavor.updatedAt
                                  )}
                                  alt={flavor.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                                />
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                  Current
                                </p>
                              </div>
                            )}
                            {/* Preview of New Image */}
                            {editFlavorImagePreview && (
                              <div className="flex-shrink-0">
                                <Image
                                  width={48}
                                  height={48}
                                  src={editFlavorImagePreview}
                                  alt="New preview"
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                                />
                                <p className="text-xs text-green-600 mt-1 text-center">
                                  New
                                </p>
                              </div>
                            )}
                          </div>
                          {editFlavorImageFile && (
                            <button
                              onClick={() => {
                                setEditFlavorImageFile(null);
                                setEditFlavorImagePreview(null);
                              }}
                              className="mt-2 text-sm text-red-600 hover:text-red-800"
                            >
                              Remove new image
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
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
                              className="rounded border-gray-300 text-[#FF5D39] focus:ring-[#FF5D39]"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Active
                            </span>
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateFlavorAdmin(flavor.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => {
                                setEditingFlavor(null);
                                setEditFlavorImageFile(null);
                                setEditFlavorImagePreview(null);
                              }}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 flex-1">
                          {/* Flavor Image */}
                          <div className="flex-shrink-0">
                            {flavor.imageUrl ? (
                              <Image
                                width={48}
                                height={48}
                                src={normalizeImageSrc(
                                  flavor.imageUrl,
                                  flavor.updatedAt
                                )}
                                alt={flavor.name}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                                onError={(e) => {
                                  console.error(
                                    "Image failed to load for",
                                    flavor.name,
                                    "URL:",
                                    e.currentTarget.src
                                  );
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Flavor Info */}
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
                            {flavor.aliases && flavor.aliases.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                Aliases: {flavor.aliases.join(", ")}
                              </p>
                            )}
                          </div>
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
                              // Clear image edit state
                              setEditFlavorImageFile(null);
                              setEditFlavorImagePreview(null);

                              // Force refresh the flavor data to get the latest image
                              setFlavors((prev) =>
                                prev.map((f) =>
                                  f.id === flavor.id
                                    ? {
                                        ...f,
                                        updatedAt: new Date().toISOString(),
                                      }
                                    : f
                                )
                              );
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


      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Header with Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Inventory Management
                  </h2>
                  <p className="text-gray-600">
                    Monitor and manage stock levels
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Array.isArray(inventoryAlerts) ? inventoryAlerts.length : 0}
                </div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </div>
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Low Stock Alerts
              </h3>
            </div>

            {Array.isArray(inventoryAlerts) && inventoryAlerts.length > 0 ? (
              <div className="p-6">
                <div className="grid gap-4">
                  {inventoryAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="group relative bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <svg
                                className="w-5 h-5 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {alert.flavor?.name || "Unknown Flavor"}
                              </h4>
                              {alert.flavor?.aliases &&
                                alert.flavor.aliases.length > 0 && (
                                  <p className="text-sm text-gray-500">
                                    Also known as:{" "}
                                    {alert.flavor.aliases.join(", ")}
                                  </p>
                                )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <svg
                                  className="w-4 h-4 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-600">
                                  On Hand
                                </span>
                              </div>
                              <div className="text-xl font-bold text-gray-900">
                                {alert.onHand || 0}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <svg
                                  className="w-4 h-4 text-yellow-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-600">
                                  Reserved
                                </span>
                              </div>
                              <div className="text-xl font-bold text-gray-900">
                                {alert.reserved || 0}
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <svg
                                  className="w-4 h-4 text-red-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-600">
                                  Safety Stock
                                </span>
                              </div>
                              <div className="text-xl font-bold text-red-600">
                                {alert.safetyStock || 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 ml-6">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              defaultValue={alert.onHand || 0}
                              id={`inventory-input-${alert.flavorId}`}
                              className="w-24 px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-bold text-gray-900 bg-yellow-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:bg-white transition-colors"
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
                            <span className="text-sm text-gray-500">units</span>
                          </div>
                          <button
                            onClick={() => {
                              const input = document.getElementById(
                                `inventory-input-${alert.flavorId}`
                              ) as HTMLInputElement;
                              const newStock = parseInt(input.value);
                              if (!isNaN(newStock)) {
                                updateInventory(alert.flavorId, newStock);
                              }
                            }}
                            disabled={updatingInventory[alert.flavorId]}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {updatingInventory[alert.flavorId] ? (
                              <>
                                <svg
                                  className="w-4 h-4 animate-spin"
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
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Updating...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                  />
                                </svg>
                                Update Stock
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All Good!
                </h3>
                <p className="text-gray-600">
                  No inventory alerts at this time. All stock levels are within
                  safe limits.
                </p>
              </div>
            )}
          </div>

          {/* All Flavors Inventory Management */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                All Flavors Inventory
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage stock levels for all flavors
              </p>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                {flavors.map((flavor) => (
                  <div
                    key={flavor.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {flavor.name}
                          </h4>
                          {!flavor.active && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        {flavor.aliases && flavor.aliases.length > 0 && (
                          <p className="text-sm text-gray-500 mb-3">
                            Also known as: {flavor.aliases.join(", ")}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center gap-2 mb-1">
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                              <span className="text-sm font-medium text-gray-600">
                                On Hand
                              </span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {flavor.inventory?.onHand ?? 0}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center gap-2 mb-1">
                              <svg
                                className="w-4 h-4 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-sm font-medium text-gray-600">
                                Reserved
                              </span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {flavor.inventory?.reserved ?? 0}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center gap-2 mb-1">
                              <svg
                                className="w-4 h-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                              <span className="text-sm font-medium text-gray-600">
                                Safety Stock
                              </span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {flavor.inventory?.safetyStock ?? 5}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center gap-2 mb-1">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                              <span className="text-sm font-medium text-gray-600">
                                Available
                              </span>
                            </div>
                            <div className="text-xl font-bold text-blue-600">
                              {Math.max(
                                0,
                                (flavor.inventory?.onHand ?? 0) -
                                  (flavor.inventory?.reserved ?? 0) -
                                  (flavor.inventory?.safetyStock ?? 5)
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-6">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            defaultValue={flavor.inventory?.onHand ?? 0}
                            id={`inventory-input-all-${flavor.id}`}
                            className="w-24 px-3 py-2 border-2 border-gray-400 rounded-lg text-sm font-bold text-gray-900 bg-blue-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:bg-white transition-colors"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const newStock = parseInt(
                                  (e.target as HTMLInputElement).value
                                );
                                if (!isNaN(newStock)) {
                                  updateInventory(flavor.id, newStock);
                                }
                              }
                            }}
                          />
                          <span className="text-sm text-gray-500">units</span>
                        </div>
                        <button
                          onClick={() => {
                            const input = document.getElementById(
                              `inventory-input-all-${flavor.id}`
                            ) as HTMLInputElement;
                            const newStock = parseInt(input.value);
                            if (!isNaN(newStock)) {
                              updateInventory(flavor.id, newStock);
                            }
                          }}
                          disabled={updatingInventory[flavor.id]}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {updatingInventory[flavor.id] ? (
                            <>
                              <svg
                                className="w-4 h-4 animate-spin"
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
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Updating...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                              </svg>
                              Update Stock
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">
                      Total Categories
                    </h4>
                    <p className="text-lg text-[#FF5D39] font-bold">
                      {systemConfig.totalCategories || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">
                      Total Flavors
                    </h4>
                    <p className="text-lg text-[#FF5D39] font-bold">
                      {systemConfig.totalFlavors || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">
                      Total Products
                    </h4>
                    <p className="text-lg text-[#FF5D39] font-bold">
                      {systemConfig.totalProducts || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">
                      Default Prices
                    </h4>
                    <div className="space-y-1">
                      {systemConfig.defaultPrices &&
                        Object.entries(systemConfig.defaultPrices).map(
                          ([type, price]) => (
                            <p
                              key={type}
                              className="text-sm text-[#FF5D39] font-semibold"
                            >
                              {type}: ${price}
                            </p>
                          )
                        )}
                    </div>
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
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">
                      Supported Product Types
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(systemConfig.supportedProductTypes) &&
                        systemConfig.supportedProductTypes.map(
                          (type, index) => (
                            <span
                              key={index}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                            >
                              {type}
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

const AdminPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5D39] mx-auto mb-4"></div>
            <p className="text-black text-lg">Loading admin panel...</p>
          </div>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
};

export default AdminPage;
