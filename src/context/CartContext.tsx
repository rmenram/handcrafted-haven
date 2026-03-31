'use client';

import { useEffect } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

type Product = {
  _id: string;
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
  isCartEnabled: boolean;
  userRole: 'purchaser' | 'artisan' | 'admin' | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, nextQuantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userRole, setUserRole] = useState<'purchaser' | 'artisan' | 'admin' | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUserRole() {
      try {
        const response = await fetch('/api/users/me', { cache: 'no-store' });

        if (!isMounted || !response.ok) {
          if (isMounted) {
            setUserRole(null);
          }
          return;
        }

        const data = (await response.json()) as {
          user?: { role?: 'purchaser' | 'artisan' | 'admin' };
        };

        if (!isMounted) {
          return;
        }

        setUserRole(data.user?.role ?? null);
      } catch {
        if (isMounted) {
          setUserRole(null);
        }
      }
    }

    loadUserRole();

    return () => {
      isMounted = false;
    };
  }, []);

  const isCartEnabled = userRole === 'purchaser';
  const effectiveCartItems = useMemo(
    () => (isCartEnabled ? cartItems : []),
    [cartItems, isCartEnabled]
  );

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!isCartEnabled) {
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    if (!isCartEnabled) {
      return;
    }

    setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, nextQuantity: number) => {
    if (!isCartEnabled) {
      return;
    }

    if (nextQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity: nextQuantity } : item
      )
    );
  };

  const clearCart = () => {
    if (!isCartEnabled) {
      return;
    }

    setCartItems([]);
  };

  const totals = useMemo(() => {
    const total = effectiveCartItems.reduce(
      (runningTotal, item) => runningTotal + item.product.price * item.quantity,
      0
    );
    const count = effectiveCartItems.reduce(
      (runningCount, item) => runningCount + item.quantity,
      0
    );
    return { total, count };
  }, [effectiveCartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems: effectiveCartItems,
        isCartEnabled,
        userRole,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal: () => (isCartEnabled ? totals.total : 0),
        getCartItemsCount: () => (isCartEnabled ? totals.count : 0),
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
