export async function uploadImage(file) {
  if (!file) {
    throw new Error("No image selected.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image size must be less than 10MB.");
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "opera_products");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/yfkdrau6/image/upload",
    {
      method: "POST",
      body: data,
    }
  );

  const result = await res.json();

  if (!res.ok || !result.secure_url) {
    console.error("Cloudinary Upload Error:", result);
    throw new Error(
      result?.error?.message || "Cloudinary image upload failed."
    );
  }

  return result.secure_url;
}