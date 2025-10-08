import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  category: string;
  imageUrl?: string | null;
  updatedAt?: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product, imageFile?: File | null) => void;
  product: Product | null;
  productCategories: string[];
  isLoading?: boolean;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  productCategories,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      console.log("EditProductModal: Product data received:", product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock || 0,
        category: product.category,
      });
      // Set image preview if product has an image
      if (product.imageUrl) {
        // Normalize the image URL to include the API base URL
        const normalizedUrl = normalizeImageSrc(product.imageUrl, product.updatedAt);
        setImagePreview(normalizedUrl);
      } else {
        setImagePreview(null);
      }
      // Clear any selected new image file
      setImageFile(null);
    }
  }, [product]);

  // Helper function to normalize image URLs (same as in admin page)
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
        return `${path}${cacheBuster}`;
      }
      return `${apiUrl}${path}${cacheBuster}`;
    }

    // Handle full URLs (already complete)
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }

    // Default fallback
    return "/assets/images/slider.png";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onSave({
        ...product,
        ...formData,
      }, imageFile);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(product?.imageUrl || null);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
          Edit Product
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1f2937',
                backgroundColor: 'white',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                color: '#1f2937',
                backgroundColor: 'white',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                Price
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#1f2937',
                  backgroundColor: 'white',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#1f2937',
                  backgroundColor: 'white',
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1f2937',
                backgroundColor: 'white',
              }}
              required
            >
              <option value="">Select category</option>
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1f2937',
                backgroundColor: 'white',
              }}
            />
            
            {/* Image Preview */}
            {imagePreview && (
              <div style={{ marginTop: '12px' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {imageFile ? 'New image selected' : 'Current image'}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: isLoading ? '#9ca3af' : '#dc2626',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;