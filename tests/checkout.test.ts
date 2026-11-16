import assert from "node:assert/strict";
import test from "node:test";
import { isValidFreeShippingPromo, shippingFor, validateCheckoutBody } from "../src/lib/checkoutValidation.ts";
import { clearAllStockHolds, getHeldQuantity, rekeyStockHold, releaseStockHold, tryReserveStock } from "../src/lib/stockHold.ts";

const valid = {
  contact: { email: "buyer@example.com" }, paymentMethod: "billplz",
  shipping: { firstName: "A", lastName: "B", address1: "1 Road", city: "KL", state: "Selangor", postcode: "50000", country: "MY" },
  cartItems: [{ variantId: "12", quantity: 2 }],
};

test("checkout accepts Malaysia only and selects regional shipping", () => {
  assert.ok(validateCheckoutBody(valid));
  assert.equal(shippingFor("Selangor"), 10);
  assert.equal(shippingFor("Sabah"), 15);
  assert.equal(shippingFor("Sabah", true), 0);
  assert.equal(shippingFor("Selangor", isValidFreeShippingPromo("freeshippingforjack")), 0);
  assert.equal(isValidFreeShippingPromo("  FREESHIPPINGFORJACK  "), true);
  assert.equal(isValidFreeShippingPromo("wrongcode"), false);
  assert.equal(isValidFreeShippingPromo(""), false);
  assert.equal(isValidFreeShippingPromo("vip", "VIP"), true);
  assert.equal(validateCheckoutBody({ ...valid, promoCode: "freeshippingforjack" })?.promoCode, "freeshippingforjack");
  assert.equal(validateCheckoutBody({ ...valid, promoCode: "  FREESHIPPINGFORJACK  " })?.promoCode, "FREESHIPPINGFORJACK");
  assert.equal(validateCheckoutBody({ ...valid, shipping: { ...valid.shipping, country: "SG" } }), null);
  assert.equal(validateCheckoutBody({ ...valid, paymentMethod: "cod" }), null);
  assert.equal(validateCheckoutBody({ ...valid, contact: { email: "buyer@example.com", phone: "asdf" } }), null);
  assert.equal(validateCheckoutBody({ ...valid, contact: { email: "buyer@example.com", phone: "012-345 6789" } })?.contact.phone, "+60123456789");
  assert.deepEqual(
    validateCheckoutBody({ ...valid, cartItems: [{ variantId: "12", quantity: 2 }, { variantId: "12", quantity: 3 }] })?.cartItems,
    [{ variantId: "12", quantity: 5 }],
  );
  assert.equal(
    validateCheckoutBody({ ...valid, cartItems: [{ variantId: "12", quantity: 15 }, { variantId: "12", quantity: 6 }] }),
    null,
  );
});

test("stock hold prevents concurrent overselling and expires after TTL", () => {
  clearAllStockHolds();
  const products = [{ id: 12, stock_status: "instock", manage_stock: true, stock_quantity: 1 }];
  const cart = [{ variantId: "12", quantity: 1 }];
  const t0 = 1_000_000;

  assert.equal(tryReserveStock("hold-a", cart, products, 10 * 60_000, t0), true);
  assert.equal(getHeldQuantity(12, t0), 1);
  assert.equal(tryReserveStock("hold-b", cart, products, 10 * 60_000, t0), false);

  rekeyStockHold("hold-a", "bill-1");
  releaseStockHold("bill-1");
  assert.equal(getHeldQuantity(12, t0), 0);

  assert.equal(tryReserveStock("hold-b", cart, products, 10 * 60_000, t0), true);
  assert.equal(tryReserveStock("hold-c", cart, products, 10 * 60_000, t0 + 10 * 60_000 - 1), false);
  assert.equal(tryReserveStock("hold-c", cart, products, 10 * 60_000, t0 + 10 * 60_000), true);
  clearAllStockHolds();
});
