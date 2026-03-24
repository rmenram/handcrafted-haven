'use client';

import { CartProvider } from '@/context/CartContext';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
