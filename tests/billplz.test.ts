import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyBillplzSignature } from "../src/lib/billplz.ts";

test("Billplz signatures reject modified payment data", () => {
  const key = "test-x-signature-key";
  const params = new URLSearchParams({ "billplz[id]": "bill1", "billplz[paid]": "true", "billplz[paid_at]": "2026-10-07" });
  const source = "billplzidbill1|billplzpaid_at2026-10-07|billplzpaidtrue";
  params.set("billplz[x_signature]", createHmac("sha256", key).update(source).digest("hex"));
  assert.equal(verifyBillplzSignature(params, key), true);
  params.set("billplz[paid]", "false");
  assert.equal(verifyBillplzSignature(params, key), false);
});
