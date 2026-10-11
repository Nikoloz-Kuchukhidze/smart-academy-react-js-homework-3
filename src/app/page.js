"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

function ProductCard({ product, onDelete }) {
  return (
    <article className={styles.productCard}>
      <div className={styles.imageContainer}>
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={styles.productImage}
          unoptimized
        />
      </div>
      <div className={styles.productDetails}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.productTitle}>{product.title}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.cardFooter}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          {onDelete && (
            <button
              className={styles.deleteButton}
              onClick={() => onDelete(product)}
              type="button"
              aria-label={`${product.title} - წაშლა`}
            >
              წაშლა
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(
          "https://dummyjson.com/products?limit=20",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("პროდუქტების ჩატვირთვა ვერ მოხერხდა.");
        }

        const data = await response.json();

        if (!Array.isArray(data.products)) {
          throw new Error("სერვერიდან მიღებული პროდუქტების სია არასწორია.");
        }

        setProducts(data.products.slice(0, 20));
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "პროდუქტების ჩატვირთვისას მოულოდნელი შეცდომა მოხდა.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  function deleteProduct(productToDelete) {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productToDelete.id),
    );
    setDeletedProducts((currentDeletedProducts) => [
      ...currentDeletedProducts,
      productToDelete,
    ]);
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>ონლაინ მაღაზია</p>
          <h1>პროდუქტები</h1>
          <p className={styles.subtitle}>
            აღმოაჩინე ჩვენი რჩეული პროდუქტები
          </p>
        </header>

        {isLoading && <p className={styles.status}>პროდუქტები იტვირთება...</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && (
          <>
            <section className={styles.section} aria-labelledby="products-title">
              <div className={styles.sectionHeading}>
                <h2 id="products-title">ყველა პროდუქტი</h2>
                <span className={styles.count}>{products.length} პროდუქტი</span>
              </div>
              {products.length > 0 ? (
                <div className={styles.productGrid}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onDelete={deleteProduct}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>ყველა პროდუქტი წაშლილია.</p>
              )}
            </section>

            {deletedProducts.length > 0 && (
              <section
                className={styles.section}
                aria-labelledby="deleted-title"
              >
                <div className={styles.sectionHeading}>
                  <h2 id="deleted-title">წაშლილი პროდუქტები</h2>
                  <span className={styles.count}>
                    {deletedProducts.length} პროდუქტი
                  </span>
                </div>
                <div className={styles.productGrid}>
                  {deletedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
