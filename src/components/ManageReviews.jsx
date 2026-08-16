import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Image as ImageIcon,
  Star,
  Trash2,
  X,
  Video,
  RefreshCw,
} from "lucide-react";

import { db } from "../firebase";

function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [selectedReview, setSelectedReview] = useState(null);
  const [expandedReview, setExpandedReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  /* =========================================================
     FETCH REVIEWS
  ========================================================= */

  const fetchReviews = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const reviewsRef = collection(db, "reviews");

      let snapshot;

      try {
        const reviewsQuery = query(
          reviewsRef,
          orderBy("createdAt", "desc")
        );

        snapshot = await getDocs(reviewsQuery);
      } catch (error) {
        console.warn(
          "Ordered reviews fetch failed. Fetching without order.",
          error
        );

        snapshot = await getDocs(reviewsRef);
      }

      const fetchedReviews = [];

      snapshot.forEach((reviewDoc) => {
        fetchedReviews.push({
          id: reviewDoc.id,
          ...reviewDoc.data(),
        });
      });

      fetchedReviews.sort((a, b) => {
        const getTime = (review) => {
          if (review.createdAt?.seconds) {
            return review.createdAt.seconds * 1000;
          }

          if (review.createdAt?.toMillis) {
            return review.createdAt.toMillis();
          }

          if (review.date) {
            const date = new Date(review.date).getTime();

            if (!Number.isNaN(date)) {
              return date;
            }
          }

          return 0;
        };

        return getTime(b) - getTime(a);
      });

      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);

      alert(
        "Reviews load nahi ho sake. Firebase permissions aur reviews collection check karein."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  /* =========================================================
     PRODUCT LIST
  ========================================================= */

  const products = useMemo(() => {
    const productMap = new Map();

    reviews.forEach((review) => {
      const productId = review.productId || "unknown";

      const productName =
        review.productName || "Unknown Product";

      if (!productMap.has(productId)) {
        productMap.set(productId, productName);
      }
    });

    return Array.from(productMap.entries())
      .map(([id, name]) => ({
        id,
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [reviews]);

  /* =========================================================
     STATUS
  ========================================================= */

  const getReviewStatus = (review) => {
    if (review?.status === "approved") {
      return "approved";
    }

    if (review?.status === "rejected") {
      return "rejected";
    }

    return "pending";
  };

  /* =========================================================
     FILTERED REVIEWS
  ========================================================= */

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const status = getReviewStatus(review);

      if (filter !== "all" && status !== filter) {
        return false;
      }

      if (
        productFilter !== "all" &&
        review.productId !== productFilter
      ) {
        return false;
      }

      if (
        ratingFilter !== "all" &&
        Number(review.rating || 0) !== Number(ratingFilter)
      ) {
        return false;
      }

      if (search.trim()) {
        const searchText = search.toLowerCase().trim();

        const searchableText = `
          ${review.name || ""}
          ${review.email || ""}
          ${review.productName || ""}
          ${review.title || ""}
          ${review.comment || ""}
          ${review.productId || ""}
        `.toLowerCase();

        if (!searchableText.includes(searchText)) {
          return false;
        }
      }

      return true;
    });
  }, [
    reviews,
    filter,
    productFilter,
    ratingFilter,
    search,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    reviews.forEach((review) => {
      const status = getReviewStatus(review);

      if (status === "pending") {
        pending++;
      }

      if (status === "approved") {
        approved++;
      }

      if (status === "rejected") {
        rejected++;
      }
    });

    return {
      total: reviews.length,
      pending,
      approved,
      rejected,
    };
  }, [reviews]);

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const updateReviewStatus = async (reviewId, status) => {
    try {
      setActionLoading(reviewId);

      await updateDoc(doc(db, "reviews", reviewId), {
        status,
      });

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                status,
              }
            : review
        )
      );

      setSelectedReview((prev) =>
        prev?.id === reviewId
          ? {
              ...prev,
              status,
            }
          : prev
      );
    } catch (error) {
      console.error(
        "Error updating review status:",
        error
      );

      alert(
        "Review status update nahi ho saka."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     DELETE REVIEW
  ========================================================= */

  const deleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Kya aap is review ko permanently delete karna chahte hain?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(reviewId);

      await deleteDoc(doc(db, "reviews", reviewId));

      setReviews((prev) =>
        prev.filter((review) => review.id !== reviewId)
      );

      if (selectedReview?.id === reviewId) {
        setSelectedReview(null);
      }

      if (expandedReview === reviewId) {
        setExpandedReview(null);
      }
    } catch (error) {
      console.error(
        "Error deleting review:",
        error
      );

      alert(
        "Review delete nahi ho saka."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatReviewDate = (review) => {
    try {
      if (review.createdAt?.seconds) {
        return new Date(
          review.createdAt.seconds * 1000
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      if (review.createdAt?.toDate) {
        return review.createdAt.toDate().toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        );
      }

      if (review.date) {
        return review.date;
      }

      return "N/A";
    } catch {
      return "N/A";
    }
  };

  /* =========================================================
     MEDIA URL
  ========================================================= */

  const getMediaUrl = (review) => {
    if (!review?.media) {
      return null;
    }

    if (typeof review.media === "string") {
      return review.media;
    }

    if (
      typeof review.media === "object" &&
      review.media !== null
    ) {
      return (
        review.media.secure_url ||
        review.media.url ||
        review.media.src ||
        review.media.image ||
        null
      );
    }

    return null;
  };

  /* =========================================================
     STARS
  ========================================================= */

  const renderStars = (rating, size = "normal") => {
    const numericRating = Number(rating || 0);

    const starClass =
      size === "small"
        ? "w-3.5 h-3.5"
        : "w-4 h-4";

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starClass} ${
              star <= numericRating
                ? "fill-amber-400 text-amber-400"
                : "text-neutral-300"
            }`}
          />
        ))}
      </div>
    );
  };

  /* =========================================================
     STATUS STYLE
  ========================================================= */

  const getStatusStyle = (status) => {
    if (status === "approved") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-9 h-9 mx-auto border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />

          <p className="text-sm text-neutral-500 mt-4">
            Reviews loading...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-neutral-900">
              Manage Reviews
            </h2>

            <span className="px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[10px] font-bold text-neutral-600">
              {stats.total}
            </span>
          </div>

          <p className="text-sm text-neutral-500 mt-1">
            Customer reviews ko manage, approve,
            reject aur delete karein.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReviews(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition disabled:opacity-60"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          {refreshing ? "Refreshing..." : "Refresh Reviews"}
        </button>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL */}

        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`text-left bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition ${
            filter === "all"
              ? "border-neutral-900 ring-1 ring-neutral-900"
              : "border-neutral-200"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Total Reviews
          </p>

          <p className="text-3xl font-black text-neutral-900 mt-2">
            {stats.total}
          </p>

          <p className="text-[11px] text-neutral-400 mt-1">
            All customer reviews
          </p>
        </button>

        {/* PENDING */}

        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`text-left bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition ${
            filter === "pending"
              ? "border-amber-500 ring-1 ring-amber-500"
              : "border-neutral-200"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Pending
          </p>

          <p className="text-3xl font-black text-amber-600 mt-2">
            {stats.pending}
          </p>

          <p className="text-[11px] text-neutral-400 mt-1">
            Waiting for approval
          </p>
        </button>

        {/* APPROVED */}

        <button
          type="button"
          onClick={() => setFilter("approved")}
          className={`text-left bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition ${
            filter === "approved"
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-neutral-200"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Approved
          </p>

          <p className="text-3xl font-black text-emerald-600 mt-2">
            {stats.approved}
          </p>

          <p className="text-[11px] text-neutral-400 mt-1">
            Published reviews
          </p>
        </button>

        {/* REJECTED */}

        <button
          type="button"
          onClick={() => setFilter("rejected")}
          className={`text-left bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition ${
            filter === "rejected"
              ? "border-red-500 ring-1 ring-red-500"
              : "border-neutral-200"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Rejected
          </p>

          <p className="text-3xl font-black text-red-600 mt-2">
            {stats.rejected}
          </p>

          <p className="text-[11px] text-neutral-400 mt-1">
            Rejected reviews
          </p>
        </button>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* SEARCH */}

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm transition"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* STATUS */}

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-neutral-200 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* PRODUCT */}

          <select
            value={productFilter}
            onChange={(e) =>
              setProductFilter(e.target.value)
            }
            className="w-full h-11 px-4 rounded-xl border border-neutral-200 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm bg-white"
          >
            <option value="all">All Products</option>

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
              </option>
            ))}
          </select>

          {/* RATING */}

          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(e.target.value)
            }
            className="w-full h-11 px-4 rounded-xl border border-neutral-200 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm bg-white"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* CLEAR FILTERS */}

        {(search ||
          filter !== "all" ||
          productFilter !== "all" ||
          ratingFilter !== "all") && (
          <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setProductFilter("all");
                setRatingFilter("all");
              }}
              className="text-xs font-bold text-neutral-600 hover:text-neutral-900"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          RESULT COUNT
      ===================================================== */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Showing{" "}
          <span className="font-black text-neutral-900">
            {filteredReviews.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-neutral-700">
            {reviews.length}
          </span>{" "}
          reviews
        </p>
      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {filteredReviews.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center">
            <Star className="w-8 h-8 text-neutral-300" />
          </div>

          <h3 className="text-lg font-black text-neutral-900 mt-5">
            No Reviews Found
          </h3>

          <p className="text-sm text-neutral-500 mt-1">
            Is filter ke according koi review nahi mila.
          </p>

          {(search ||
            filter !== "all" ||
            productFilter !== "all" ||
            ratingFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
                setProductFilter("all");
                setRatingFilter("all");
              }}
              className="mt-5 px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* ===================================================
           REVIEWS LIST
        =================================================== */

        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const status = getReviewStatus(review);
            const isExpanded =
              expandedReview === review.id;

            const mediaUrl = getMediaUrl(review);
            const isVideo =
              review.mediaType === "video";

            const customerName = review.isAnonymous
              ? "Anonymous"
              : review.name || "Anonymous";

            const initial = customerName
              .charAt(0)
              .toUpperCase();

            return (
              <div
                key={review.id}
                className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="p-5">
                  {/* TOP */}

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    {/* CUSTOMER */}

                    <div className="flex gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                        <span className="text-lg font-black text-neutral-700">
                          {initial}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-neutral-900">
                            {customerName}
                          </h3>

                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full border font-black uppercase tracking-wider ${getStatusStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </div>

                        {review.email && (
                          <p className="text-xs text-neutral-500 mt-1 break-all">
                            {review.email}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {renderStars(review.rating)}

                          <span className="text-xs font-bold text-neutral-700">
                            {Number(review.rating || 0)}/5
                          </span>

                          <span className="text-xs text-neutral-400">
                            {formatReviewDate(review)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReview(review)
                        }
                        className="h-10 px-4 border border-neutral-200 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 hover:bg-neutral-50 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>

                      {status !== "approved" && (
                        <button
                          type="button"
                          disabled={
                            actionLoading === review.id
                          }
                          onClick={() =>
                            updateReviewStatus(
                              review.id,
                              "approved"
                            )
                          }
                          className="h-10 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                      )}

                      {status !== "rejected" && (
                        <button
                          type="button"
                          disabled={
                            actionLoading === review.id
                          }
                          onClick={() =>
                            updateReviewStatus(
                              review.id,
                              "rejected"
                            )
                          }
                          className="h-10 px-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={
                          actionLoading === review.id
                        }
                        onClick={() =>
                          deleteReview(review.id)
                        }
                        className="h-10 w-10 bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
                        aria-label="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* PRODUCT */}

                  <div className="mt-5 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                      Product
                    </p>

                    <p className="text-sm font-black text-neutral-900 mt-1">
                      {review.productName ||
                        "Unknown Product"}
                    </p>

                    {review.productId && (
                      <p className="text-[10px] text-neutral-400 mt-1 font-mono break-all">
                        ID: {review.productId}
                      </p>
                    )}
                  </div>

                  {/* REVIEW */}

                  <div className="mt-5">
                    {review.title && (
                      <h4 className="font-black text-neutral-900">
                        {review.title}
                      </h4>
                    )}

                    <p
                      className={`text-sm text-neutral-600 leading-relaxed ${
                        review.title ? "mt-2" : ""
                      } ${
                        !isExpanded
                          ? "line-clamp-3"
                          : ""
                      }`}
                    >
                      {review.comment ||
                        "No comment provided."}
                    </p>

                    {review.comment &&
                      review.comment.length > 180 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReview(
                              isExpanded
                                ? null
                                : review.id
                            )
                          }
                          className="mt-2 text-xs font-black text-neutral-900 flex items-center gap-1 hover:underline"
                        >
                          {isExpanded
                            ? "Show Less"
                            : "Read More"}

                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                  </div>

                  {/* MEDIA */}

                  {(mediaUrl || review.youtubeUrl) && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {mediaUrl && (
                        <a
                          href={mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold hover:bg-neutral-100 transition"
                        >
                          {isVideo ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <ImageIcon className="w-4 h-4" />
                          )}

                          View {isVideo ? "Video" : "Image"}
                        </a>
                      )}

                      {review.youtubeUrl && (
                        <a
                          href={review.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                        >
                          <Video className="w-4 h-4" />
                          YouTube Video
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {selectedReview && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="sticky top-0 bg-white border-b border-neutral-200 p-5 flex items-center justify-between z-10">
              <div className="min-w-0">
                <h3 className="text-lg font-black text-neutral-900">
                  Review Details
                </h3>

                <p className="text-xs text-neutral-500 mt-1 truncate">
                  {selectedReview.productName ||
                    "Product Review"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReview(null)
                }
                className="w-10 h-10 shrink-0 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="p-5 space-y-6">
              {/* CUSTOMER */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                    <span className="font-black text-neutral-700">
                      {(
                        selectedReview.isAnonymous
                          ? "Anonymous"
                          : selectedReview.name ||
                            "Anonymous"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="font-black text-neutral-900">
                      {selectedReview.isAnonymous
                        ? "Anonymous"
                        : selectedReview.name ||
                          "Anonymous"}
                    </p>

                    {selectedReview.email && (
                      <p className="text-xs text-neutral-500 mt-1 break-all">
                        {selectedReview.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:text-right">
                  {renderStars(
                    selectedReview.rating
                  )}

                  <p className="text-xs text-neutral-500 mt-1">
                    {formatReviewDate(
                      selectedReview
                    )}
                  </p>
                </div>
              </div>

              {/* PRODUCT */}

              <div className="border border-neutral-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  Product
                </p>

                <p className="text-sm font-black text-neutral-900 mt-2">
                  {selectedReview.productName ||
                    "Unknown Product"}
                </p>

                {selectedReview.productId && (
                  <p className="text-[10px] text-neutral-400 mt-1 font-mono break-all">
                    ID: {selectedReview.productId}
                  </p>
                )}
              </div>

              {/* STATUS */}

              <div className="border border-neutral-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  Status
                </p>

                <span
                  className={`inline-flex mt-2 text-xs px-3 py-1.5 rounded-full border font-black uppercase ${getStatusStyle(
                    getReviewStatus(selectedReview)
                  )}`}
                >
                  {getReviewStatus(selectedReview)}
                </span>
              </div>

              {/* TITLE */}

              {selectedReview.title && (
                <div>
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                    Title
                  </p>

                  <h4 className="font-black text-neutral-900 mt-2">
                    {selectedReview.title}
                  </h4>
                </div>
              )}

              {/* REVIEW */}

              <div>
                <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                  Review
                </p>

                <p className="text-sm text-neutral-700 leading-7 mt-2 whitespace-pre-wrap">
                  {selectedReview.comment ||
                    "No comment provided."}
                </p>
              </div>

              {/* YOUTUBE */}

              {selectedReview.youtubeUrl && (
                <a
                  href={selectedReview.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 hover:bg-red-100 transition"
                >
                  <Video className="w-5 h-5 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-sm font-black">
                      YouTube Video
                    </p>

                    <p className="text-xs mt-1 break-all">
                      {selectedReview.youtubeUrl}
                    </p>
                  </div>
                </a>
              )}

              {/* CUSTOMER MEDIA */}

              {getMediaUrl(selectedReview) && (
                <div>
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">
                    Customer Media
                  </p>

                  {selectedReview.mediaType ===
                  "video" ? (
                    <video
                      src={getMediaUrl(selectedReview)}
                      controls
                      className="w-full max-h-[500px] rounded-xl bg-black"
                    />
                  ) : (
                    <img
                      src={getMediaUrl(selectedReview)}
                      alt="Customer review"
                      className="w-full max-h-[500px] object-contain rounded-xl bg-neutral-100 border border-neutral-200"
                    />
                  )}
                </div>
              )}

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-200">
                {getReviewStatus(
                  selectedReview
                ) !== "approved" && (
                  <button
                    type="button"
                    disabled={
                      actionLoading ===
                      selectedReview.id
                    }
                    onClick={() =>
                      updateReviewStatus(
                        selectedReview.id,
                        "approved"
                      )
                    }
                    className="flex-1 min-w-[140px] h-12 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    <Check className="w-4 h-4" />
                    Approve Review
                  </button>
                )}

                {getReviewStatus(
                  selectedReview
                ) !== "rejected" && (
                  <button
                    type="button"
                    disabled={
                      actionLoading ===
                      selectedReview.id
                    }
                    onClick={() =>
                      updateReviewStatus(
                        selectedReview.id,
                        "rejected"
                      )
                    }
                    className="flex-1 min-w-[140px] h-12 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 disabled:opacity-50 transition"
                  >
                    <X className="w-4 h-4" />
                    Reject Review
                  </button>
                )}

                <button
                  type="button"
                  disabled={
                    actionLoading ===
                    selectedReview.id
                  }
                  onClick={() =>
                    deleteReview(
                      selectedReview.id
                    )
                  }
                  className="h-12 px-5 bg-neutral-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageReviews;