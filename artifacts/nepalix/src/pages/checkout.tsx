import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface Customer {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  landmark: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  images: string[];
}

interface CartItem {
  id: string;
  quantity: number;
  variant: {
    size: string;
    color: string;
  };
  product: Product;
}

interface CheckoutData {
  customer: Customer;
  items: CartItem[];
}

export default function Checkout() {
  const [location] = useLocation();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.split("?")[1] || "");
      const seed = params.get("admin_order_seed");
      if (!seed) {
        setError("No checkout data found");
        return;
      }
      const decoded = JSON.parse(atob(seed));
      setCheckoutData(decoded);
    } catch (e) {
      setError("Failed to parse checkout data");
    }
  }, [location]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Checkout Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
        <div className="text-white">Loading checkout...</div>
      </div>
    );
  }

  const total = checkoutData.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#070B14] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-[#0F172A] rounded-2xl p-6 border border-white/10 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Customer Details</h2>
              <div className="space-y-3 text-gray-300">
                <p><span className="text-gray-500">Name:</span> {checkoutData.customer.fullName}</p>
                <p><span className="text-gray-500">Phone:</span> {checkoutData.customer.phone}</p>
                <p><span className="text-gray-500">Email:</span> {checkoutData.customer.email}</p>
                <p><span className="text-gray-500">City:</span> {checkoutData.customer.city}</p>
                <p><span className="text-gray-500">Address:</span> {checkoutData.customer.address}</p>
                <p><span className="text-gray-500">Landmark:</span> {checkoutData.customer.landmark}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-[#0F172A] rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Order Items</h2>
              <div className="space-y-4">
                {checkoutData.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden">
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.product.name}</p>
                      <p className="text-gray-500 text-sm">
                        {item.variant.size} / {item.variant.color} × {item.quantity}
                      </p>
                      <p className="text-cyan-400 font-semibold">Rs. {item.product.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between text-white font-bold text-xl">
                  <span>Total</span>
                  <span>Rs. {total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}