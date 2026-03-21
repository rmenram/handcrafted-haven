'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type Product = {
  id: number;
  name: string;
  artisanName: string;
  price: number;
};

type CartItem = {
  product: Product;
  quantity: number;
  customization?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, nextQuantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
};

const initialCartItems: CartItem[] = [
  {
    product: {
      id: 1,
      name: 'Hand-thrown Ceramic Mug',
      artisanName: 'Elena Pottery Studio',
      price: 24,
    },
    quantity: 2,
    customization: 'Matte glaze with initials',
  },
  {
    product: {
      id: 2,
      name: 'Woven Wall Hanging',
      artisanName: 'Thread & Loom',
      price: 49,
    },
    quantity: 1,
  },
];

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, nextQuantity: number) => {
    if (nextQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: nextQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totals = useMemo(() => {
    const total = cartItems.reduce(
      (runningTotal, item) => runningTotal + item.product.price * item.quantity,
      0
    );
    const count = cartItems.reduce((runningCount, item) => runningCount + item.quantity, 0);
    return { total, count };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal: () => totals.total,
        getCartItemsCount: () => totals.count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
