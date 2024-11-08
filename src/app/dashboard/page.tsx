"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { ProductHeader } from "@/components/ProductHeader";
import { Pagination } from "@/components/Pagination";
import { ProductModal } from "@/components/ProductModal";
import { Product, CreateProductDTO, UpdateProductDTO } from "@/types/product";
import { Loader } from "@/components/Loader";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const router = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { loading: authLoading } = useAuth();

  const {
    filteredProducts,
    loading,
    error,
    fetchAllProducts,
    searchProducts,
    sortProducts,
    searchTerm,
    currentPage,
    totalPages,
    isModalOpen,
    changePage,
    selectedProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    setModalOpen,
    setSelectedProduct,
  } = useProducts();

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchAllProducts();
      setIsInitialLoading(false);
    };

    loadInitialData();
  }, [fetchAllProducts]);

  const handleSave = async (formData: CreateProductDTO) => {
    if (selectedProduct) {
      await updateProduct(selectedProduct.id, formData as UpdateProductDTO);
    } else {
      await createProduct(formData);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("isAuthenticated");
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (authLoading) {
    return <Loader />;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && !isInitialLoading && <Loader />}

      <ProductHeader
        onSearch={searchProducts}
        onSort={sortProducts}
        searchTerm={searchTerm}
        onNewProduct={() => setModalOpen(true)}
        handleLogout={handleLogout}
      />

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isInitialLoading
            ? Array.from({ length: 9 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            : filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
        />

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleSave}
          product={selectedProduct || undefined}
        />
      </main>
    </div>
  );
}
