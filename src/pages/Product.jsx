import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CartContext } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { db } from "../firebase";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  Heart,
  Droplet,
  Clock,
  Package,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import ProductReviews from "../components/ProductReviews";

const extractUrl = (item) => {
  if (!item) return null;

  if (typeof item === "string") {
    return item.trim();
  }

  if (typeof item === "object") {
    if (item.secure_url) {
      return String(item.secure_url).trim();
    }

    if (item.url) {
      return String(item.url).trim();
    }

    if (item.src) {
      return String(item.src).trim();
    }

    if (item.image) {
      return extractUrl(item.image);
    }
  }

  return null;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=4000&auto=format&fit=crop";

const formatPrice = (value) => {
  const num = Number(value);

  return isNaN(num) ? "0" : num.toLocaleString();
};

const getVariantColorStyle = (colorName) => {
  const color = String(colorName || "")
    .toLowerCase()
    .trim();

  if (
    color.includes("red") ||
    color.includes("ruby") ||
    color.includes("maroon")
  ) {
    return {
      background: "#FAF3F3",
      border: "#E2B8B8",
      text: "#7E2A2A",
      dot: "#B83A3A",
    };
  }

  if (
    color.includes("pink") ||
    color.includes("rose")
  ) {
    return {
      background: "#FAF4F7",
      border: "#EAD0DA",
      text: "#8A4762",
      dot: "#D982A5",
    };
  }

  if (
    color.includes("green") ||
    color.includes("mint") ||
    color.includes("emerald")
  ) {
    return {
      background: "#F2F8F4",
      border: "#BDD9C4",
      text: "#316440",
      dot: "#5EAA72",
    };
  }

  if (
    color.includes("blue") ||
    color.includes("navy") ||
    color.includes("sapphire") ||
    color.includes("sky")
  ) {
    return {
      background: "#F2F6FB",
      border: "#B8CFE6",
      text: "#284E72",
      dot: "#527FAE",
    };
  }

  if (
    color.includes("purple") ||
    color.includes("lavender")
  ) {
    return {
      background: "#F6F3F9",
      border: "#D8C6E6",
      text: "#5D4175",
      dot: "#8D68A9",
    };
  }

  if (
    color.includes("gold") ||
    color.includes("golden") ||
    color.includes("champagne") ||
    color.includes("amber")
  ) {
    return {
      background: "#FAF7EE",
      border: "#E2D3A5",
      text: "#7A6424",
      dot: "#C5A059",
    };
  }

  if (
    color.includes("white") ||
    color.includes("opal")
  ) {
    return {
      background: "#FAFAFA",
      border: "#E0E0E0",
      text: "#383838",
      dot: "#EBEBEB",
    };
  }

  if (
    color.includes("black") ||
    color.includes("onyx")
  ) {
    return {
      background: "#F3F3F3",
      border: "#A3A3A3",
      text: "#171717",
      dot: "#171717",
    };
  }

  return {
    background: "#F7F7F6",
    border: "#D6D3D1",
    text: "#404040",
    dot: "#A3A3A3",
  };
};

function Product() {
  const { id } = useParams();

  const { addToCart } =
    useContext(CartContext);

  const {
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  const [quantity, setQuantity] =
    useState(1);

  const [isZoomOpen, setIsZoomOpen] =
    useState(false);

  const [isDescriptionOpen, setIsDescriptionOpen] =
    useState(false);

  const [reviews, setReviews] =
    useState([]);

  const [relatedProducts, setRelatedProducts] =
    useState([]);

  const isWishlisted = product
    ? isInWishlist(product.id)
    : false;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    setLoading(true);

    const syncProductData = (data) => {
      if (!isMounted) return;

      setProduct(data);

      const primaryImg =
        extractUrl(data.image) ||
        extractUrl(data.imageUrl) ||
        (Array.isArray(data.images)
          ? extractUrl(data.images[0])
          : "") ||
        "";

      setSelectedImage(primaryImg);

      if (
        Array.isArray(data.variants) &&
        data.variants.length > 0
      ) {
        const firstVariant =
          data.variants[0];

        setSelectedVariant(firstVariant);

        const variantImage =
          extractUrl(
            firstVariant.imageUrl
          ) ||
          extractUrl(firstVariant.image) ||
          extractUrl(firstVariant.img);

        if (variantImage) {
          setSelectedImage(variantImage);
        }
      }

      setLoading(false);
    };

    const fetchProductAndRelated =
      async () => {
        try {
          const rawId =
            String(id).trim();

          const directDocRef = doc(
            db,
            "products",
            rawId
          );

          const directSnap =
            await getDoc(directDocRef);

          let activeProductData =
            null;

          let activeProductId =
            rawId;

          if (directSnap.exists()) {
            activeProductId =
              directSnap.id;

            activeProductData = {
              id: activeProductId,
              ...directSnap.data(),
            };

            syncProductData(
              activeProductData
            );
          } else {
            const productsRef =
              collection(
                db,
                "products"
              );

            const qId = query(
              productsRef,
              where("id", "==", rawId)
            );

            const snapId =
              await getDocs(qId);

            if (!snapId.empty) {
              const docData =
                snapId.docs[0];

              activeProductId =
                docData.id;

              activeProductData = {
                id: activeProductId,
                ...docData.data(),
              };

              syncProductData(
                activeProductData
              );
            } else {
              const allDocsSnap =
                await getDocs(
                  productsRef
                );

              let matched = null;

              allDocsSnap.forEach(
                (d) => {
                  if (matched) return;

                  const data = d.data();

                  const target =
                    rawId.toLowerCase();

                  if (
                    String(d.id).toLowerCase() ===
                      target ||
                    String(
                      data.id || ""
                    ).toLowerCase() ===
                      target ||
                    String(
                      data.sku || ""
                    ).toLowerCase() ===
                      target
                  ) {
                    matched = {
                      id: d.id,
                      ...data,
                    };
                  }
                }
              );

              if (matched) {
                activeProductId =
                  matched.id;

                activeProductData =
                  matched;

                syncProductData(
                  matched
                );
              } else {
                if (isMounted) {
                  setProduct(null);
                  setLoading(false);
                }

                return;
              }
            }
          }

          // -----------------------------
          // FETCH PRODUCT REVIEWS
          // -----------------------------

          if (activeProductId) {
            const reviewsRef =
              collection(
                db,
                "reviews"
              );

            const qReviews = query(
              reviewsRef,
              where(
                "productId",
                "==",
                activeProductId
              )
            );

            const reviewSnap =
              await getDocs(
                qReviews
              );

            const fetchedReviews =
              [];

            reviewSnap.forEach(
              (revDoc) => {
                fetchedReviews.push({
                  id: revDoc.id,
                  ...revDoc.data(),
                });
              }
            );

            fetchedReviews.sort(
              (a, b) => {
                const dateA =
                  a.createdAt?.seconds
                    ? a.createdAt.seconds *
                      1000
                    : new Date(
                        a.date || 0
                      ).getTime();

                const dateB =
                  b.createdAt?.seconds
                    ? b.createdAt.seconds *
                      1000
                    : new Date(
                        b.date || 0
                      ).getTime();

                return dateB - dateA;
              }
            );

            if (isMounted) {
              setReviews(
                fetchedReviews
              );
            }

            // -----------------------------
            // RELATED PRODUCTS
            // -----------------------------

            const allProductsSnap =
              await getDocs(
                collection(
                  db,
                  "products"
                )
              );

            const relList = [];

            allProductsSnap.forEach(
              (docSnap) => {
                if (
                  docSnap.id !==
                  activeProductId
                ) {
                  relList.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                  });
                }
              }
            );

            if (isMounted) {
              setRelatedProducts(
                relList.slice(0, 4)
              );
            }
          }
        } catch (error) {
          console.error(
            "Error fetching product details:",
            error
          );

          if (isMounted) {
            setProduct(null);
            setLoading(false);
          }
        }
      };

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    fetchProductAndRelated();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // -----------------------------
  // AVERAGE RATING
  // -----------------------------

  const averageRating = useMemo(() => {
    if (
      !reviews ||
      reviews.length === 0
    ) {
      return "5.0";
    }

    const total =
      reviews.reduce(
        (acc, curr) =>
          acc +
          Number(
            curr.rating || 0
          ),
        0
      );

    return (
      total / reviews.length
    ).toFixed(1);
  }, [reviews]);

  // -----------------------------
  // ALL PRODUCT IMAGES
  // -----------------------------

  const allImages = useMemo(() => {
    if (!product) return [];

    const list = [];

    if (product.image) {
      list.push(
        extractUrl(
          product.image
        )
      );
    }

    if (product.imageUrl) {
      list.push(
        extractUrl(
          product.imageUrl
        )
      );
    }

    if (
      Array.isArray(product.images)
    ) {
      product.images.forEach(
        (img) => {
          list.push(
            extractUrl(img)
          );
        }
      );
    }

    if (
      Array.isArray(product.variants)
    ) {
      product.variants.forEach(
        (variant) => {
          if (!variant) return;

          const vImg =
            extractUrl(
              variant.imageUrl
            ) ||
            extractUrl(
              variant.image
            ) ||
            extractUrl(
              variant.img
            );

          if (vImg) {
            list.push(vImg);
          }
        }
      );
    }

    return Array.from(
      new Set(
        list.filter(Boolean)
      )
    );
  }, [product]);

  // -----------------------------
  // PRICE
  // -----------------------------

  const baseEffectivePrice =
    useMemo(() => {
      if (!product) return 0;

      if (
        product.price !==
          undefined &&
        product.price !== null &&
        product.price !== ""
      ) {
        return Number(
          product.price
        );
      }

      if (product.discountPrice) {
        return Number(
          product.discountPrice
        );
      }

      if (product.finalPrice) {
        return Number(
          product.finalPrice
        );
      }

      return 0;
    }, [product]);

  const baseOriginalPrice =
    useMemo(() => {
      if (!product) return 0;

      if (product.originalPrice) {
        return Number(
          product.originalPrice
        );
      }

      if (product.comparePrice) {
        return Number(
          product.comparePrice
        );
      }

      return 0;
    }, [product]);

  const effectivePrice =
    baseEffectivePrice *
    quantity;

  const originalPrice =
    baseOriginalPrice *
    quantity;

  const hasDiscount =
    originalPrice >
      effectivePrice &&
    baseOriginalPrice > 0;

  const discountPercent =
    hasDiscount
      ? Math.round(
          ((baseOriginalPrice -
            baseEffectivePrice) /
            baseOriginalPrice) *
            100
        )
      : 0;

  // -----------------------------
  // SEO DATA
  // -----------------------------

  const seoDescription = useMemo(() => {
    if (!product) {
      return "";
    }

    const rawDescription =
      product.description ||
      product.details ||
      `Shop ${product.name || product.title || "premium jewellery"} from Opera Jewellery.`;

    return String(rawDescription)
      .replace(/<[^>]*>?/gm, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
  }, [product]);

  const seoLongDescription = useMemo(() => {
    if (!product) {
      return "";
    }

    const rawDescription =
      product.description ||
      product.details ||
      `Explore ${product.name || product.title || "this jewellery piece"} from Opera Jewellery.`;

    return String(rawDescription)
      .replace(/<[^>]*>?/gm, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);
  }, [product]);

  const seoProductName =
    product?.name ||
    product?.title ||
    "Luxury Jewellery";

  const canonicalUrl = useMemo(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return "";
    }

    return `${window.location.origin}${window.location.pathname}`;
  }, [id]);

  const seoProductImage =
    allImages.length > 0
      ? allImages[0]
      : FALLBACK_IMAGE;

  const schemaImages =
    allImages.length > 0
      ? allImages
      : [seoProductImage];

  const productAvailability =
    product?.inStock === false ||
    product?.stock === 0 ||
    product?.available === false
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  const productSchema = useMemo(() => {
    if (!product) {
      return null;
    }

    const schema = {
      "@context":
        "https://schema.org",
      "@type": "Product",
      name: seoProductName,
      image: schemaImages,
      description:
        seoLongDescription,
      sku:
        product.sku ||
        product.id ||
        id,
      brand: {
        "@type": "Brand",
        name: "Opera Jewellery",
      },
      offers: {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: "PKR",
        price:
          Number(
            baseEffectivePrice
          ) || 0,
        availability:
          productAvailability,
        itemCondition:
          "https://schema.org/NewCondition",
      },
    };

    if (
      reviews.length > 0 &&
      Number(averageRating) > 0
    ) {
      schema.aggregateRating = {
        "@type":
          "AggregateRating",
        ratingValue:
          Number(averageRating),
        reviewCount:
          reviews.length,
        bestRating: 5,
        worstRating: 1,
      };
    }

    return schema;
  }, [
    product,
    seoProductName,
    schemaImages,
    seoLongDescription,
    id,
    canonicalUrl,
    baseEffectivePrice,
    productAvailability,
    reviews.length,
    averageRating,
  ]);

  const breadcrumbSchema = useMemo(() => {
    if (!product) {
      return null;
    }

    return {
      "@context":
        "https://schema.org",
      "@type":
        "BreadcrumbList",
      itemListElement: [
        {
          "@type":
            "ListItem",
          position: 1,
          name: "Home",
          item:
            typeof window !==
            "undefined"
              ? `${window.location.origin}/`
              : "/",
        },
        {
          "@type":
            "ListItem",
          position: 2,
          name: "Jewelry",
          item:
            typeof window !==
            "undefined"
              ? `${window.location.origin}/`
              : "/",
        },
        {
          "@type":
            "ListItem",
          position: 3,
          name: "Zircon Set",
          item:
            canonicalUrl,
        },
        {
          "@type":
            "ListItem",
          position: 4,
          name: seoProductName,
          item:
            canonicalUrl,
        },
      ],
    };
  }, [
    product,
    canonicalUrl,
    seoProductName,
  ]);

  // -----------------------------
  // ADD TO CART
  // -----------------------------

  const handleAddToCartClick =
    () => {
      if (!product) return;

      addToCart({
        ...product,
        price:
          baseEffectivePrice,
        selectedColor:
          selectedVariant
            ? selectedVariant.name ||
              selectedVariant.color
            : null,
        selectedImage:
          selectedImage ||
          FALLBACK_IMAGE,
        quantity,
      });
    };

  // -----------------------------
  // WHATSAPP
  // -----------------------------

  const handleWhatsAppClick =
    () => {
      if (!product) return;

      const phoneNo =
        "923173355420";

      const productName =
        product.name ||
        product.title ||
        "Product";

      const variantName =
        selectedVariant
          ? selectedVariant.name ||
            selectedVariant.color
          : "Standard";

      const message =
        `Hello, I want to order this product:\n\n` +
        `*Product:* ${productName}\n` +
        `*SKU:* ${
          product.sku || "N/A"
        }\n` +
        `*Finish/Color:* ${variantName}\n` +
        `*Quantity:* ${quantity}\n` +
        `*Total Price:* Rs.${formatPrice(
          effectivePrice
        )}\n` +
        `*Link:* ${window.location.href}`;

      const whatsappUrl =
        `https://wa.me/${phoneNo}?text=${encodeURIComponent(
          message
        )}`;

      window.open(
        whatsappUrl,
        "_blank"
      );
    };

  // -----------------------------
  // ADD REVIEW TO FIREBASE
  // -----------------------------

  const handleAddReview =
    async (newReviewData) => {
      try {
        if (!product?.id) {
          throw new Error(
            "Product ID is missing."
          );
        }

        const reviewPayload = {
          productId: product.id,

          productName:
            product.name ||
            product.title ||
            "",

          name:
            newReviewData.name ||
            "Anonymous",

          email:
            newReviewData.email ||
            "",

          title:
            newReviewData.title ||
            "",

          rating: Number(
            newReviewData.rating || 0
          ),

          comment:
            newReviewData.comment ||
            "",

          media:
            newReviewData.media ||
            null,

          mediaType:
            newReviewData.mediaType ||
            null,

          youtubeUrl:
            newReviewData.youtubeUrl ||
            "",

          isAnonymous:
            Boolean(
              newReviewData.isAnonymous
            ),

          date:
            new Date().toLocaleDateString(
              "en-US",
              {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }
            ),

          createdAt:
            serverTimestamp(),
        };

        const docRef =
          await addDoc(
            collection(
              db,
              "reviews"
            ),
            reviewPayload
          );

        setReviews((prev) => [
          {
            id: docRef.id,

            ...reviewPayload,

            createdAt: {
              seconds:
                Math.floor(
                  Date.now() / 1000
                ),
            },
          },
          ...prev,
        ]);
      } catch (error) {
        console.error(
          "Error adding review:",
          error
        );

        throw error;
      }
    };

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // -----------------------------
  // PRODUCT NOT FOUND
  // -----------------------------

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 font-sans">
        <Helmet>
          <title>
            Product Not Found | Opera Jewellery
          </title>

          <meta
            name="robots"
            content="noindex, follow"
          />
        </Helmet>

        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-3">
          Product Not Found
        </h2>

        <Link
          to="/"
          className="bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-sm"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const productName =
    product.name ||
    product.title ||
    "New Arrival Zircon Set";

  const productDesc =
    product.description ||
    product.details ||
    "Explore our exclusive collection.";

  return (
    <div className="bg-white min-h-screen text-neutral-900 pb-20 font-sans selection:bg-neutral-900 selection:text-white">
      <Helmet>
        {/* ============================= */}
        {/* BASIC SEO */}
        {/* ============================= */}

        <title>
          {productName} | Opera Jewellery
        </title>

        <meta
          name="description"
          content={seoDescription}
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large"
        />

        <link
          rel="canonical"
          href={canonicalUrl}
        />

        {/* ============================= */}
        {/* OPEN GRAPH / FACEBOOK / WHATSAPP */}
        {/* ============================= */}

        <meta
          property="og:type"
          content="product"
        />

        <meta
          property="og:title"
          content={`${productName} | Opera Jewellery`}
        />

        <meta
          property="og:description"
          content={seoDescription}
        />

        <meta
          property="og:url"
          content={canonicalUrl}
        />

        <meta
          property="og:site_name"
          content="Opera Jewellery"
        />

        <meta
          property="og:image"
          content={seoProductImage}
        />

        <meta
          property="og:image:alt"
          content={productName}
        />

        <meta
          property="og:image:type"
          content="image/jpeg"
        />

        <meta
          property="product:price:amount"
          content={String(
            baseEffectivePrice
          )}
        />

        <meta
          property="product:price:currency"
          content="PKR"
        />

        {/* ============================= */}
        {/* TWITTER CARD */}
        {/* ============================= */}

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={`${productName} | Opera Jewellery`}
        />

        <meta
          name="twitter:description"
          content={seoDescription}
        />

        <meta
          name="twitter:image"
          content={seoProductImage}
        />

        <meta
          name="twitter:image:alt"
          content={productName}
        />

        {/* ============================= */}
        {/* PRODUCT JSON-LD */}
        {/* ============================= */}

        {productSchema && (
          <script type="application/ld+json">
            {JSON.stringify(
              productSchema
            )}
          </script>
        )}

        {/* ============================= */}
        {/* BREADCRUMB JSON-LD */}
        {/* ============================= */}

        {breadcrumbSchema && (
          <script type="application/ld+json">
            {JSON.stringify(
              breadcrumbSchema
            )}
          </script>
        )}
      </Helmet>

      {/* BREADCRUMBS */}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-6 pb-6">
        <div className="text-xs sm:text-sm font-normal text-neutral-400 tracking-wide flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link
            to="/"
            className="hover:text-neutral-900 transition"
          >
            Home
          </Link>

          <span>/</span>

          <span>Jewelry</span>

          <span>/</span>

          <span>Zircon Set</span>

          <span>/</span>

          <span className="text-neutral-900 font-medium">
            {productName}
          </span>
        </div>
      </div>

      {/* MAIN CONTAINER */}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

          {/* LEFT: PRODUCT CARE */}

          <div className="lg:col-span-3 space-y-3.5 order-3 lg:order-1 bg-[#FAFAFA] p-4 sm:p-5 rounded-2xl border border-neutral-100 shadow-2xs">
            <h3 className="text-sm font-bold text-neutral-900 tracking-wide uppercase">
              Product Care
            </h3>

            <div className="pt-1">
              <span className="text-[11px] font-bold text-neutral-900 block mb-1 uppercase tracking-wider">
                Material
              </span>

              <p className="text-xs text-neutral-600 leading-relaxed">
                Gold & Silver Finish Jewelry.
                Handle with care to maintain
                shine.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-2.5 p-2.5 bg-white border border-neutral-200/80 rounded-xl shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200 shrink-0 mt-0.5">
                  <Droplet className="w-3.5 h-3.5 text-neutral-600" />
                </div>

                <p className="text-[11px] text-neutral-700 leading-snug">
                  Avoid water, perfumes &
                  chemicals
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-white border border-neutral-200/80 rounded-xl shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200 shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-600" />
                </div>

                <p className="text-[11px] text-neutral-700 leading-snug">
                  Remove before swimming or
                  exercise
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-white border border-neutral-200/80 rounded-xl shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200 shrink-0 mt-0.5">
                  <Package className="w-3.5 h-3.5 text-neutral-600" />
                </div>

                <p className="text-[11px] text-neutral-700 leading-snug">
                  Store in a dry box or soft
                  pouch
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-white border border-neutral-200/80 rounded-xl shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
                </div>

                <p className="text-[11px] text-neutral-700 leading-snug">
                  Clean gently with a soft dry
                  cloth
                </p>
              </div>
            </div>
          </div>

          {/* MIDDLE: MAIN IMAGE */}

          <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
            <div
              onClick={() =>
                setIsZoomOpen(true)
              }
              className="w-full aspect-square bg-[#F9F9F8] overflow-hidden border border-neutral-200 relative group shadow-sm rounded-2xl cursor-zoom-in"
              title="Click to view full screen"
            >
              <img
                src={
                  selectedImage ||
                  FALLBACK_IMAGE
                }
                alt={productName}
                width="4000"
                height="4000"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.src =
                    FALLBACK_IMAGE;
                }}
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  toggleWishlist(
                    product
                  );
                }}
                className="absolute top-4 right-4 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md border border-neutral-200 hover:scale-110 transition-all cursor-pointer z-10"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted
                      ? "text-red-500 fill-red-500"
                      : "text-neutral-800"
                  }`}
                />
              </button>
            </div>

            {allImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map(
                  (imgUrl, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() =>
                        setSelectedImage(
                          imgUrl
                        )
                      }
                      className={`w-20 aspect-square shrink-0 overflow-hidden border transition bg-[#F9F9F8] cursor-pointer rounded-xl ${
                        selectedImage ===
                        imgUrl
                          ? "border-neutral-900 opacity-100 shadow-xs"
                          : "border-neutral-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${productName} - Image ${
                          idx + 1
                        }`}
                        width="4000"
                        height="4000"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS */}

          <div className="lg:col-span-4 flex flex-col space-y-5 order-2 lg:order-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-snug">
                  {productName}
                </h1>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i <
                            Math.floor(
                              Number(
                                averageRating
                              )
                            )
                              ? "fill-amber-500"
                              : "text-neutral-300"
                          }`}
                        />
                      )
                    )}
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-neutral-900">
                    {averageRating}
                  </span>

                  <span className="text-xs text-neutral-500">
                    ({reviews.length} reviews)
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-500 tracking-wider mt-1.5 font-medium">
                  SKU-
                  {product.sku ||
                    "2001"}
                </p>
              </div>

              {hasDiscount && (
                <span className="bg-[#F3F3F3] text-neutral-900 text-sm sm:text-base font-bold px-5 py-3 uppercase tracking-wider shrink-0 border border-neutral-200 rounded-xl">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* PRICE */}

            <div className="flex items-baseline justify-between border-t border-b border-neutral-200 py-4">
              <span className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider">
                Price
              </span>

              <div className="flex items-center gap-4">
                {hasDiscount && (
                  <span className="text-sm sm:text-base text-neutral-400 line-through">
                    Rs.
                    {formatPrice(
                      originalPrice
                    )}
                  </span>
                )}

                <span className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  Rs.
                  {formatPrice(
                    effectivePrice
                  )}
                </span>
              </div>
            </div>

            {/* SHIPPING */}

            <div className="flex items-center justify-between text-sm border-b border-neutral-200 pb-4">
              <span className="font-bold text-xs sm:text-sm text-neutral-500 uppercase tracking-wider">
                Shipping Time
              </span>

              <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                3-5 Business Days
              </span>
            </div>

            {/* VARIANTS */}

            {Array.isArray(
              product.variants
            ) &&
              product.variants.length >
                0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-xs sm:text-sm text-neutral-800 uppercase tracking-wide">
                      Select Color /
                      Finish:
                    </span>

                    <span className="text-neutral-900 font-bold text-xs sm:text-sm uppercase tracking-wide">
                      {selectedVariant?.name ||
                        selectedVariant?.color ||
                        "Standard"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {product.variants.map(
                      (v, i) => {
                        const colorName =
                          v.name ||
                          v.color ||
                          `Finish ${
                            i + 1
                          }`;

                        const style =
                          getVariantColorStyle(
                            colorName
                          );

                        const isSelected =
                          selectedVariant ===
                          v;

                        const vThumb =
                          extractUrl(
                            v.imageUrl
                          ) ||
                          extractUrl(
                            v.image
                          ) ||
                          extractUrl(
                            v.img
                          );

                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => {
                              setSelectedVariant(
                                v
                              );

                              if (
                                vThumb
                              ) {
                                setSelectedImage(
                                  vThumb
                                );
                              }
                            }}
                            style={{
                              backgroundColor:
                                style.background,
                              borderColor:
                                isSelected
                                  ? "#171717"
                                  : style.border,
                            }}
                            className={`px-4 py-3 border text-xs sm:text-sm font-medium transition flex items-center gap-3 cursor-pointer rounded-xl ${
                              isSelected
                                ? "ring-2 ring-neutral-900 font-bold shadow-sm"
                                : "opacity-85 hover:opacity-100 hover:shadow-2xs"
                            }`}
                          >
                            {vThumb ? (
                              <img
                                src={vThumb}
                                alt={`${productName} ${colorName}`}
                                width="100"
                                height="100"
                                className="w-6 h-6 object-cover rounded-md border border-black/10 shrink-0"
                              />
                            ) : (
                              <span
                                className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                                style={{
                                  backgroundColor:
                                    style.dot,
                                }}
                              />
                            )}

                            <span
                              style={{
                                color:
                                  style.text,
                              }}
                              className="text-xs sm:text-sm font-medium"
                            >
                              {
                                colorName
                              }
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

            {/* QUANTITY */}

            <div className="flex items-center justify-between border-b border-neutral-200 pb-5 pt-2">
              <span className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider">
                Quantity
              </span>

              <div className="flex items-center border border-neutral-300 w-36 bg-white rounded-xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                  className="w-12 h-12 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition font-bold text-lg cursor-pointer"
                >
                  -
                </button>

                <span className="flex-1 text-center text-base font-bold text-neutral-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      quantity + 1
                    )
                  }
                  className="w-12 h-12 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition font-bold text-lg cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-12 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    toggleWishlist(
                      product
                    )
                  }
                  className="col-span-4 border-2 border-neutral-900 hover:bg-neutral-50 text-neutral-900 h-14 px-3 font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl shadow-2xs active:scale-[0.98]"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted
                        ? "text-red-500 fill-red-500"
                        : "text-neutral-900"
                    }`}
                  />

                  WISHLIST
                </button>

                <button
                  type="button"
                  onClick={
                    handleAddToCartClick
                  }
                  className="col-span-8 bg-neutral-900 hover:bg-neutral-800 text-white h-14 px-3 font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl shadow-md active:scale-[0.98]"
                >
                  <svg
                    className="w-4 h-4 fill-white shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>

                  BUY IT NOW
                </button>
              </div>

              {/* WHATSAPP */}

              <button
                type="button"
                onClick={
                  handleWhatsAppClick
                }
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white h-14 px-3 font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl shadow-md active:scale-[0.98]"
              >
                <svg
                  className="w-4 h-4 fill-white shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>

                ORDER VIA WHATSAPP
              </button>
            </div>

            {/* PRODUCT DESCRIPTION ACCORDION */}

            <div className="border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() =>
                  setIsDescriptionOpen(
                    (prev) => !prev
                  )
                }
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Product Description
                </span>
                <span className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700">
                  <span className="text-lg leading-none font-light">
                    {isDescriptionOpen
                      ? "−"
                      : "+"}
                  </span>
                </span>
              </button>
              {isDescriptionOpen && (
                <div className="pb-3 pt-1">
                  <div
                    className="text-xs text-neutral-600 leading-relaxed prose prose-neutral max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: productDesc,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CUSTOMER REVIEWS */}

        <div className="mt-16 pt-8 border-t border-neutral-200">
          <ProductReviews
            reviews={reviews}
            onAddReview={
              handleAddReview
            }
            productName={
              productName
            }
            productImage={
              selectedImage ||
              FALLBACK_IMAGE
            }
          />
        </div>

        {/* RELATED PRODUCTS */}

        {relatedProducts.length >
          0 && (
          <div className="mt-16 pt-10 border-t border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-950 tracking-wide uppercase mb-6">
              You May Also Like
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(
                (item) => {
                  const itemImg =
                    extractUrl(
                      item.image
                    ) ||
                    extractUrl(
                      item.imageUrl
                    ) ||
                    FALLBACK_IMAGE;

                  const itemPrice =
                    item.price ||
                    item.discountPrice ||
                    0;

                  return (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      className="group block bg-[#FAFAFA] rounded-2xl overflow-hidden border border-neutral-200/80 p-3 transition hover:shadow-md"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 mb-3 relative">
                        <img
                          src={itemImg}
                          alt={
                            item.name ||
                            item.title ||
                            "Related jewellery product"
                          }
                          width="1000"
                          height="1000"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate mb-1">
                        {item.name ||
                          item.title}
                      </h4>

                      <p className="text-xs font-semibold text-neutral-600">
                        Rs.
                        {formatPrice(
                          itemPrice
                        )}
                      </p>
                    </Link>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>

      {/* ZOOM MODAL */}

      {isZoomOpen && (
        <div
          onClick={() =>
            setIsZoomOpen(false)
          }
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() =>
              setIsZoomOpen(false)
            }
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={
              selectedImage ||
              FALLBACK_IMAGE
            }
            alt={`${productName} - Full Size`}
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          />
        </div>
      )}
    </div>
  );
}

export default Product;