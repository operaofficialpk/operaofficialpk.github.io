export async function uploadImage(file) {
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

  return result.secure_url;
}