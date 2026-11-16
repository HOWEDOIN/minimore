import assert from "node:assert/strict";
import test from "node:test";
import { hasRealImage, isDummyImageUrl } from "../src/utils/imageHelper.ts";

test("dummy image detection blocks placeholder markers without blocking real filenames containing 800", () => {
  assert.equal(isDummyImageUrl("https://admin.minimore.my/wp-content/uploads/2026/06/800.jpg"), true);
  assert.equal(isDummyImageUrl("https://admin.minimore.my/wp-content/uploads/2026/06/800-1.jpg"), true);
  assert.equal(isDummyImageUrl("https://picsum.photos/800/800"), true);
  assert.equal(isDummyImageUrl("https://admin.minimore.my/wp-content/uploads/woocommerce_product_image_upload_error.png"), true);
  assert.equal(isDummyImageUrl(undefined), true);

  assert.equal(isDummyImageUrl("https://admin.minimore.my/wp-content/uploads/2026/10/IMG_0800.jpg"), false);
  assert.equal(isDummyImageUrl("https://admin.minimore.my/wp-content/uploads/2026/10/product-800x800.jpg"), false);

  assert.equal(hasRealImage({ images: [{ src: "https://admin.minimore.my/wp-content/uploads/2026/10/IMG_0800.jpg" }] }), true);
  assert.equal(hasRealImage({ images: [{ src: "https://admin.minimore.my/wp-content/uploads/2026/06/800.jpg" }] }), false);
  assert.equal(hasRealImage({ images: [] }), false);
});
