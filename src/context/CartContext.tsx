'use client';

import { useEffect } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Product = {
  id: string;
  name: string;
  artisanName?: string;
  price: number;
  image?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
  customization?: string;
};

type WishlistItem = {
  product: Product;
};

type ToastMessage = {
  id: number;
  message: string;
  tone: 'success' | 'error';
};

type CartContextType = {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  isCartEnabled: boolean;
  userRole: 'purchaser' | 'artisan' | 'admin' | null;
  isInWishlist: (productId: string) => boolean;
  addToCart: (product: Product, quantity?: number, customization?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, nextQuantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);
  const [userRole, setUserRole] = useState<'purchaser' | 'artisan' | 'admin' | null>(null);

  const showToast = useCallback((message: string, tone: 'success' | 'error') => {
    const toastId = Date.now() + Math.floor(Math.random() * 1000);
    setToastMessages((prev) => [...prev, { id: toastId, message, tone }]);

    window.setTimeout(() => {
      setToastMessages((prev) => prev.filter((toast) => toast.id !== toastId));
    }, 2600);
  }, []);

  const showSuccessToast = useCallback(
    (message: string) => {
      showToast(message, 'success');
    },
    [showToast]
  );

  const showErrorToast = useCallback(
    (message: string) => {
      showToast(message, 'error');
    },
    [showToast]
  );

  const isCartEnabled = userRole === 'purchaser';

  useEffect(() => {
    async function syncCart() {
      if (!isCartEnabled) {
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image ?? '',
            artisanName: item.product.artisanName ?? '',
            quantity: item.quantity,
          })),
        }),
      }).catch(() => null);

      if (!response || !response.ok) {
        showErrorToast('Unable to sync cart changes right now');
      }
    }

    void syncCart();
  }, [cartItems, isCartEnabled, showErrorToast]);

  useEffect(() => {
    async function syncWishlist() {
      if (!isCartEnabled) {
        return;
      }

      const response = await fetch('/api/wishlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: wishlistItems.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image ?? '',
            artisanName: item.product.artisanName ?? '',
          })),
        }),
      }).catch(() => null);

      if (!response || !response.ok) {
        showErrorToast('Unable to sync wishlist changes right now');
      }
    }

    void syncWishlist();
  }, [wishlistItems, isCartEnabled, showErrorToast]);

  useEffect(() => {
    let isMounted = true;

    async function loadUserAndCollections() {
      try {
        const response = await fetch('/api/users/me', { cache: 'no-store' });

        if (!isMounted || !response.ok) {
          if (isMounted) {
            setUserRole(null);
            setCartItems([]);
            setWishlistItems([]);
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

        if (data.user?.role !== 'purchaser') {
          setCartItems([]);
          setWishlistItems([]);
          return;
        }

        const [cartResponse, wishlistResponse] = await Promise.all([
          fetch('/api/cart', { cache: 'no-store' }),
          fetch('/api/wishlist', { cache: 'no-store' }),
        ]);

        const cartData = (await cartResponse.json()) as {
          items?: Array<{
            productId: string;
            name: string;
            price: number;
            image?: string;
            artisanName?: string;
            quantity: number;
          }>;
        };

        const wishlistData = (await wishlistResponse.json()) as {
          items?: Array<{
            productId: string;
            name: string;
            price: number;
            image?: string;
            artisanName?: string;
          }>;
        };

        if (isMounted && cartResponse.ok) {
          setCartItems(
            Array.isArray(cartData.items)
              ? cartData.items.map((item) => ({
                  product: {
                    id: item.productId,
                    name: item.name,
                    price: Number(item.price ?? 0),
                    image: item.image ?? '',
                    artisanName: item.artisanName ?? '',
                  },
                  quantity: Math.max(1, Number(item.quantity ?? 1)),
                }))
              : []
          );
        }

        if (isMounted && wishlistResponse.ok) {
          setWishlistItems(
            Array.isArray(wishlistData.items)
              ? wishlistData.items.map((item) => ({
                  product: {
                    id: item.productId,
                    name: item.name,
                    price: Number(item.price ?? 0),
                    image: item.image ?? '',
                    artisanName: item.artisanName ?? '',
                  },
                }))
              : []
          );
        }
      } catch {
        if (isMounted) {
          setUserRole(null);
          setCartItems([]);
          setWishlistItems([]);
        }
      }
    }

    void loadUserAndCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveCartItems = useMemo(
    () => (isCartEnabled ? cartItems : []),
    [cartItems, isCartEnabled]
  );

  const effectiveWishlistItems = useMemo(
    () => (isCartEnabled ? wishlistItems : []),
    [wishlistItems, isCartEnabled]
  );

  const addToCart = (product: Product, quantity = 1, customization?: string) => {
    if (!isCartEnabled) {
      return;
    }

    const safeQuantity = Math.max(1, Math.floor(quantity));

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);

      if (existingIndex < 0) {
        return [
          ...prev,
          {
            product,
            quantity: safeQuantity,
            customization,
          },
        ];
      }

      return prev.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: item.quantity + safeQuantity,
              customization: customization ?? item.customization,
            }
          : item
      );
    });

    if (safeQuantity > 0) {
      showSuccessToast(`${product.name} added to cart`);
    }
  };

  const removeFromCart = (productId: string) => {
    if (!isCartEnabled) {
      return;
    }

    setCartItems((prev) => {
      const removedItem = prev.find((item) => item.product.id === productId);
      if (removedItem) {
        showSuccessToast(`${removedItem.product.name} removed from cart`);
      }

      return prev.filter((item) => item.product.id !== productId);
    });
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
        item.product.id === productId ? { ...item, quantity: nextQuantity } : item
      )
    );
  };

  const clearCart = () => {
    if (!isCartEnabled) {
      return;
    }

    setCartItems([]);
  };

  const isInWishlist = (productId: string) =>
    effectiveWishlistItems.some((item) => item.product.id === productId);

  const toggleWishlist = (product: Product) => {
    if (!isCartEnabled) {
      return;
    }

    const exists = wishlistItems.some((item) => item.product.id === product.id);

    setWishlistItems((prev) =>
      prev.some((item) => item.product.id === product.id)
        ? prev.filter((item) => item.product.id !== product.id)
        : [...prev, { product }]
    );

    showSuccessToast(
      exists ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`
    );
  };

  const removeFromWishlist = (productId: string) => {
    if (!isCartEnabled) {
      return;
    }

    const removedItem = wishlistItems.find((item) => item.product.id === productId);

    setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId));

    if (removedItem) {
      showSuccessToast(`${removedItem.product.name} removed from wishlist`);
    }
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
        wishlistItems: effectiveWishlistItems,
        isCartEnabled,
        userRole,
        isInWishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        removeFromWishlist,
        showSuccessToast,
        showErrorToast,
        getCartTotal: () => (isCartEnabled ? totals.total : 0),
        getCartItemsCount: () => (isCartEnabled ? totals.count : 0),
      }}
    >
      {children}
      <div className='pointer-events-none fixed right-4 top-20 z-[80] flex w-full max-w-xs flex-col gap-2'>
        {toastMessages.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-md px-3 py-2 text-sm font-medium shadow ${
              toast.tone === 'success'
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border border-red-300 bg-red-50 text-red-900'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
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
