"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";

export default function Account() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?customer_id=${user.customer_id}`);
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null; // Will redirect

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ paddingTop: "100px", paddingBottom: "100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem" }}>My Account</h1>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", background: "transparent", cursor: "pointer" }}>
            Logout
          </button>
        </div>

        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Welcome back, {user.first_name}!</h2>
          <p>Here you can view your recent orders and manage your account.</p>
        </div>

        <div>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>Order History</h3>
          
          {isLoading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
              <Link href="/products" className="btn-primary" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '0.75rem 2rem', borderRadius: 'var(--radius-pill)', textDecoration: 'none', fontWeight: 600 }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  <th style={{ padding: "1rem 0" }}>Order ID</th>
                  <th style={{ padding: "1rem 0" }}>Date</th>
                  <th style={{ padding: "1rem 0" }}>Status</th>
                  <th style={{ padding: "1rem 0" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "1rem 0" }}>#{order.id}</td>
                    <td style={{ padding: "1rem 0" }}>{new Date(order.date_created).toLocaleDateString()}</td>
                    <td style={{ padding: "1rem 0", textTransform: "capitalize" }}>{order.status}</td>
                    <td style={{ padding: "1rem 0" }}>RM {order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
