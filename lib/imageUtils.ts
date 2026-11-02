/**
 * Converts any File object (JPEG, PNG, WebP, GIF, SVG, etc.) to a base64 Data URL.
 * Automatically resizes large raster images to ensure they comfortably fit within
 * browser localStorage quotas.
 */
export async function fileToDataUrl(file: File, maxDimension = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image"));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to convert image to data string"));
        return;
      }

      // If it's SVG or a small GIF/image, keep it as-is
      if (file.type.includes("svg") || file.type.includes("gif") || file.size < 300 * 1024) {
        resolve(result);
        return;
      }

      // For larger raster images, resize on an off-screen canvas to optimize storage
      const img = new Image();
      img.onerror = () => resolve(result); // Fallback to original if decoding fails
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP if supported, otherwise JPEG
        try {
          const compressed = canvas.toDataURL("image/webp", 0.85);
          if (compressed && compressed.startsWith("data:image/webp")) {
            resolve(compressed);
            return;
          }
        } catch {
          // Fall back to JPEG
        }

        try {
          const jpegData = canvas.toDataURL("image/jpeg", 0.85);
          resolve(jpegData || result);
        } catch {
          resolve(result);
        }
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
}

