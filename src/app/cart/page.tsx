import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import "./cart.css";

export default function CartPage() {
  return (
    <div className="page-wrapper">
      <Navbar isStatic={true} />
      
      <main className="container cart-layout">
        <h1 className="cart-title">Your Cart</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-item">
              <div className="cart-item-image-wrapper">
                <Image src="/images/skincare.png" alt="Lumière Regenerating Cream" fill className="cart-item-image" />
              </div>
              <div className="cart-item-details">
                <span className="cart-item-brand">LUMIÈRE</span>
                <Link href="/products/1" className="cart-item-name">Regenerating Cream Mini</Link>
                <span className="cart-item-variant">30ml</span>
                
                <div className="cart-item-actions">
                  <div className="quantity-selector-small">
                    <button>-</button>
                    <span>1</span>
                    <button>+</button>
                  </div>
                  <button className="remove-btn">Remove</button>
                </div>
              </div>
              <div className="cart-item-price">RM 145</div>
            </div>

            <div className="cart-item">
              <div className="cart-item-image-wrapper">
                <Image src="/images/perfume.png" alt="Aurélia Eau De Parfum" fill className="cart-item-image" />
              </div>
              <div className="cart-item-details">
                <span className="cart-item-brand">AURÉLIA</span>
                <Link href="/products/2" className="cart-item-name">Eau De Parfum 15ml</Link>
                <span className="cart-item-variant">15ml</span>
                
                <div className="cart-item-actions">
                  <div className="quantity-selector-small">
                    <button>-</button>
                    <span>1</span>
                    <button>+</button>
                  </div>
                  <button className="remove-btn">Remove</button>
                </div>
              </div>
              <div className="cart-item-price">RM 195</div>
            </div>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>RM 340</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total</span>
              <span>RM 340</span>
            </div>
            
            <button className="btn-primary checkout-btn">Proceed to Checkout</button>
            <Link href="/products" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
