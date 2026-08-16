import React, { useState, useMemo } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

// Updated Star & Theme Color
const SITE_COLOR = "#FFA500";

const ProductReviews = ({
  reviews = [],
  onAddReview,
  productName = "Ring",
  productImage =
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=60",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Filter & Sort States
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Form States
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const totalReviews = reviews.length;

  const avgRating = totalReviews
    ? (
        reviews.reduce(
          (acc, r) => acc + Number(r.rating || 0),
          0
        ) / totalReviews
      ).toFixed(1)
    : "5.0";

  // Processed Reviews
  const processedReviews = useMemo(() => {
    let result = [...reviews];

    if (filterRating !== "all") {
      result = result.filter(
        (r) => Number(r.rating) === Number(filterRating)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : new Date(a.date || 0).getTime();

        const dateB = b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : new Date(b.date || 0).getTime();

        return dateB - dateA;
      }

      if (sortBy === "oldest") {
        const dateA = a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : new Date(a.date || 0).getTime();

        const dateB = b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : new Date(b.date || 0).getTime();

        return dateA - dateB;
      }

      if (sortBy === "highest") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }

      if (sortBy === "lowest") {
        return Number(a.rating || 0) - Number(b.rating || 0);
      }

      return 0;
    });

    return result;
  }, [reviews, filterRating, sortBy]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("File size must be less than 20MB.");
      return;
    }

    setMediaFile(file);
  };

  const uploadReviewMedia = async () => {
    if (!mediaFile) return null;

    try {
      const safeName = mediaFile.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      );

      const fileName = `${Date.now()}_${safeName}`;

      const storageRef = ref(
        storage,
        `reviews/${fileName}`
      );

      await uploadBytes(storageRef, mediaFile);

      const downloadURL = await getDownloadURL(storageRef);

      return {
        url: downloadURL,
        type: mediaFile.type.startsWith("video/")
          ? "video"
          : "image",
        name: mediaFile.name,
      };
    } catch (error) {
      console.error("Review media upload error:", error);
      throw new Error(
        "Unable to upload review media."
      );
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (rating === 0) {
      alert("Please select a rating before submitting.");
      setStep(1);
      return;
    }

    if (!comment.trim()) {
      alert("Please write your review.");
      setStep(2);
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email address.");
      setStep(3);
      return;
    }

    if (!isAnonymous && !displayName.trim()) {
      alert("Please enter your display name.");
      setStep(3);
      return;
    }

    if (!onAddReview) {
      alert("Review system is not connected.");
      return;
    }

    try {
      setSubmitting(true);

      let uploadedMedia = null;

      if (mediaFile) {
        uploadedMedia = await uploadReviewMedia();
      }

      const reviewData = {
        name: isAnonymous
          ? "Anonymous"
          : displayName.trim() || "User",

        email: email.trim(),

        title: title.trim(),

        rating: Number(rating),

        comment: comment.trim(),

        media: uploadedMedia?.url || null,

        mediaType: uploadedMedia?.type || null,

        youtubeUrl: youtubeUrl.trim(),

        isAnonymous,
      };

      await onAddReview(reviewData);

      // Reset
      setShowModal(false);
      setStep(1);
      setRating(0);
      setHover(0);
      setComment("");
      setTitle("");
      setEmail("");
      setDisplayName("");
      setIsAnonymous(false);
      setMediaFile(null);
      setYoutubeUrl("");
    } catch (error) {
      console.error("Review submit error:", error);
      alert(
        error?.message ||
          "Unable to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderInteractiveStars = () => (
    <div className="flex flex-col items-center w-full">
      <div className="flex gap-2 sm:gap-3 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className="text-6xl sm:text-7xl bg-transparent border-none cursor-pointer p-0 transition-all duration-150 ease-in-out hover:scale-105"
            onClick={() => {
              setRating(star);
              setStep(2);
            }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <span
              style={{
                color:
                  star <= (hover || rating)
                    ? SITE_COLOR
                    : "#D1D5DB",
                fontWeight:
                  star <= (hover || rating)
                    ? "900"
                    : "400",
              }}
            >
              {star <= (hover || rating) ? "★" : "☆"}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-between w-full max-w-xs px-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
        <span>Poor</span>
        <span>Great</span>
      </div>
    </div>
  );

  const renderStaticStars = (starCount) => (
    <div className="flex gap-1.5 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="text-2xl sm:text-3xl font-black"
          style={{
            color:
              star <= starCount
                ? SITE_COLOR
                : "#E5E7EB",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="w-full font-sans relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6 border-b border-neutral-200 pb-8">
        <div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">
            Customer Reviews
          </h3>

          <div className="flex items-center gap-3">
            <span
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: SITE_COLOR }}
            >
              {avgRating}
            </span>

            <span className="text-base sm:text-lg text-neutral-600 font-semibold">
              {totalReviews} reviews
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Write Review */}
          <button
            type="button"
            className="text-white px-8 py-4 text-base font-bold rounded-2xl transition-all duration-200 cursor-pointer shadow-md tracking-wide hover:opacity-90"
            style={{
              backgroundColor: SITE_COLOR,
            }}
            onClick={() => {
              setStep(1);
              setRating(0);
              setShowModal(true);
            }}
          >
            Write a review
          </button>

          {/* Filter */}
          <div className="relative">
            <button
              type="button"
              title="Filter reviews"
              onClick={() => {
                setShowFilterDropdown(
                  !showFilterDropdown
                );
                setShowSortDropdown(false);
              }}
              className={`bg-white text-neutral-900 border ${
                filterRating !== "all"
                  ? "border-[#FFA500] text-[#FFA500]"
                  : "border-neutral-300"
              } w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-20 py-2">
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                  Filter by Rating
                </div>

                {[
                  { label: "All Reviews", val: "all" },
                  { label: "5 Stars Only", val: "5" },
                  { label: "4 Stars Only", val: "4" },
                  { label: "3 Stars Only", val: "3" },
                  { label: "2 Stars Only", val: "2" },
                  { label: "1 Star Only", val: "1" },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      setFilterRating(item.val);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition hover:bg-[#FFF8E7]"
                    style={{
                      color:
                        filterRating === item.val
                          ? SITE_COLOR
                          : "#374151",
                      fontWeight:
                        filterRating === item.val
                          ? 700
                          : 500,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              type="button"
              title="Sort reviews"
              onClick={() => {
                setShowSortDropdown(
                  !showSortDropdown
                );
                setShowFilterDropdown(false);
              }}
              className="bg-white text-neutral-900 border border-neutral-300 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-20 py-2">
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                  Sort by
                </div>

                {[
                  {
                    label: "Newest First",
                    val: "newest",
                  },
                  {
                    label: "Oldest First",
                    val: "oldest",
                  },
                  {
                    label: "Highest Rating",
                    val: "highest",
                  },
                  {
                    label: "Lowest Rating",
                    val: "lowest",
                  },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      setSortBy(item.val);
                      setShowSortDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition hover:bg-[#FFF8E7]"
                    style={{
                      color:
                        sortBy === item.val
                          ? SITE_COLOR
                          : "#374151",
                      fontWeight:
                        sortBy === item.val
                          ? 700
                          : 500,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col divide-y divide-neutral-200">
        {processedReviews.length === 0 ? (
          <p className="text-lg text-neutral-500 text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-100">
            No reviews found matching your criteria.
          </p>
        ) : (
          processedReviews.map((rev, index) => {
            const userName = rev.name || "Anonymous";
            const userInitial = userName
              .charAt(0)
              .toUpperCase();

            return (
              <div
                className="py-10 first:pt-0 last:border-b-0"
                key={rev.id || index}
              >
                {renderStaticStars(
                  Number(rev.rating || 5)
                )}

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold text-2xl shrink-0 border border-neutral-200 shadow-inner">
                    {userInitial}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-xl font-extrabold text-neutral-900">
                        {userName}
                      </span>

                      <span className="text-xs font-bold uppercase tracking-wider border border-neutral-300 px-3 py-1 rounded-full text-neutral-700 bg-white shadow-xs">
                        Verified Buyer
                      </span>
                    </div>

                    <span className="text-sm text-neutral-500 font-medium">
                      {rev.date || "08/16/2026"}
                    </span>
                  </div>
                </div>

                <div className="pl-0 md:pl-20">
                  {rev.title && (
                    <h4 className="text-xl font-bold text-neutral-900 mb-2.5">
                      {rev.title}
                    </h4>
                  )}

                  <p className="text-lg text-neutral-800 font-normal leading-relaxed mb-5">
                    {rev.comment}
                  </p>

                  {/* Image */}
                  {rev.media &&
                    (!rev.mediaType ||
                      rev.mediaType === "image") && (
                      <div className="flex gap-3 flex-wrap">
                        <img
                          src={rev.media}
                          alt="Review attachment"
                          className="w-32 h-32 object-cover rounded-xl border border-neutral-200 shadow-sm cursor-zoom-in transition hover:scale-105"
                        />
                      </div>
                    )}

                  {/* Video */}
                  {rev.media &&
                    rev.mediaType === "video" && (
                      <div className="max-w-md">
                        <video
                          src={rev.media}
                          controls
                          className="w-full rounded-xl border border-neutral-200 shadow-sm"
                        />
                      </div>
                    )}

                  {/* YouTube */}
                  {rev.youtubeUrl && (
                    <div className="mt-4">
                      <a
                        href={rev.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition"
                      >
                        Watch YouTube Video
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REVIEW MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative p-8 sm:p-12 my-8 border border-neutral-100">
            <button
              type="button"
              onClick={() => {
                if (!submitting) {
                  setShowModal(false);
                }
              }}
              className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 p-2 cursor-pointer transition text-2xl font-bold"
            >
              ✕
            </button>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="text-center py-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-3 tracking-tight">
                  How would you rate this product?
                </h3>

                <p className="text-base text-neutral-600 mb-10">
                  Click on a star to give your rating.
                </p>

                <div className="flex justify-center mb-8">
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-48 h-48 object-cover rounded-2xl border border-neutral-200 shadow-md"
                  />
                </div>

                <h4 className="text-2xl font-bold text-neutral-900 mb-10">
                  {productName}
                </h4>

                {renderInteractiveStars()}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8 pb-6 border-b border-neutral-200">
                  <h4 className="text-2xl font-bold text-neutral-900 mb-4">
                    {productName}
                  </h4>

                  <div className="flex justify-center gap-1.5 text-6xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          color:
                            star <= rating
                              ? SITE_COLOR
                              : "#E5E7EB",
                          fontWeight:
                            star <= rating
                              ? "900"
                              : "400",
                        }}
                      >
                        {star <= rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold uppercase tracking-wider mt-2 cursor-pointer"
                    style={{ color: SITE_COLOR }}
                  >
                    Edit Rating
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Review content (Required)
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Start writing here..."
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    className="w-full p-4 bg-white border border-neutral-300 rounded-xl text-base outline-none transition focus:border-neutral-900"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Review Title
                  </label>

                  <input
                    type="text"
                    placeholder="Give your review a title"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    className="w-full p-4 bg-white border border-neutral-300 rounded-xl text-base outline-none transition focus:border-neutral-900"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-bold uppercase tracking-wider text-neutral-800 hover:text-black cursor-pointer transition py-2"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (comment.trim()) {
                        setStep(3);
                      } else {
                        alert(
                          "Please write your review."
                        );
                      }
                    }}
                    className="text-white px-10 py-4 text-sm font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                    style={{
                      backgroundColor: SITE_COLOR,
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-2">
                    About you
                  </h3>

                  <p className="text-base text-neutral-600">
                    Please tell us more about you.
                  </p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Email address (Required)
                  </label>

                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="w-full p-4 bg-white border border-neutral-300 rounded-xl text-base outline-none transition focus:border-neutral-900"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Display name (Required)
                  </label>

                  <input
                    type="text"
                    placeholder="Display name"
                    value={displayName}
                    onChange={(e) =>
                      setDisplayName(e.target.value)
                    }
                    disabled={isAnonymous}
                    className="w-full p-4 bg-white border border-neutral-300 rounded-xl text-base outline-none transition disabled:bg-neutral-100 focus:border-neutral-900"
                  />
                </div>

                <div className="flex items-center gap-3 mb-8">
                  <input
                    type="checkbox"
                    id="anon"
                    checked={isAnonymous}
                    onChange={(e) =>
                      setIsAnonymous(e.target.checked)
                    }
                    className="w-5 h-5 cursor-pointer"
                    style={{
                      accentColor: SITE_COLOR,
                    }}
                  />

                  <label
                    htmlFor="anon"
                    className="text-sm sm:text-base text-neutral-800 font-medium cursor-pointer select-none"
                  >
                    Post review as anonymous
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm font-bold uppercase tracking-wider text-neutral-800 hover:text-black cursor-pointer transition py-2"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        email.trim() &&
                        (isAnonymous ||
                          displayName.trim())
                      ) {
                        setStep(4);
                      } else {
                        alert(
                          "Please complete the required fields."
                        );
                      }
                    }}
                    className="text-white px-10 py-4 text-sm font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                    style={{
                      backgroundColor: SITE_COLOR,
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-2">
                    Share a picture or video
                  </h3>

                  <p className="text-base text-neutral-600">
                    Upload a photo or video to support your
                    review.
                  </p>
                </div>

                <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center mb-5 relative transition bg-neutral-50/50 hover:border-neutral-400">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />

                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-10 h-10 text-neutral-500 mb-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>

                    <p className="text-sm font-semibold text-neutral-800">
                      {mediaFile ? (
                        mediaFile.name
                      ) : (
                        <>
                          <strong>
                            Click to upload
                          </strong>{" "}
                          or drag and drop
                        </>
                      )}
                    </p>

                    <p className="text-xs text-neutral-500 mt-2">
                      Maximum file size: 20MB
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    YouTube URL
                  </label>

                  <input
                    type="url"
                    placeholder="Paste your Youtube URL here"
                    value={youtubeUrl}
                    onChange={(e) =>
                      setYoutubeUrl(e.target.value)
                    }
                    className="w-full p-4 bg-white border border-neutral-300 rounded-xl text-base outline-none transition focus:border-neutral-900"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setStep(3)}
                    className="text-sm font-bold uppercase tracking-wider text-neutral-800 hover:text-black cursor-pointer transition py-2 disabled:opacity-50"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="text-white px-10 py-4 text-sm font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: SITE_COLOR,
                    }}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;