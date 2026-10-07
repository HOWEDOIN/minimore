"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import "./confirmation.css";

type Order = { number: string; total: string; paymentMethod: string; status: string; paid: boolean };

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const orderKey = sessionStorage.getItem(`minimore-order-${id}`);
    if (!orderKey) {
      queueMicrotask(() => setError("This order confirmation link cannot be verified."));
      return;
    }
    fetch(`/api/order-confirmation/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderKey }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to verify order");
        return data as Order;
      })
      .then((verified) => {
        setOrder(verified);
        if (verified.paid) {
          useCartStore.setState({ cart: [], isCartOpen: false });
          sessionStorage.removeItem(`minimore-order-${id}`);
        }
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to verify order"));
  }, [id]);

  return (
    <div className="confirm-root">
      <header className="confirm-header"><Link href="/" className="confirm-logo">Minimore</Link></header>
      <main className="confirm-main">
        <div className="confirm-card">
          {!order ? (
            <><h1 className="confirm-title">{error ? "Order not verified" : "Verifying your order…"}</h1>{error && <p className="confirm-sub" role="alert">{error}</p>}</>
          ) : (
            <>
              <div className="confirm-icon" style={!order.paid ? { background: "var(--confirm-warn, #f59e0b)" } : undefined}>{order.paid ? "✓" : "!"}</div>
              <h1 className="confirm-title">{order.paid ? "Order confirmed!" : "Payment incomplete"}</h1>
              <p className="confirm-sub">{order.paid ? "Your payment was successful. We will begin processing your order shortly." : "Your order exists, but payment has not been confirmed."}</p>
              <div className="confirm-detail-row"><span>Order number</span><strong>#{order.number}</strong></div>
              <div className="confirm-detail-row"><span>{order.paid ? "Total paid" : "Order total"}</span><strong>RM {Number(order.total).toFixed(2)}</strong></div>
              <div className="confirm-detail-row"><span>Payment method</span><strong>Billplz (Online Banking / FPX)</strong></div>
              <div className="confirm-detail-row"><span>Status</span><strong>{order.status}</strong></div>
            </>
          )}
          <Link href="/" className="confirm-cta">Continue Shopping</Link>
        </div>
      </main>
    </div>
  );
}
