'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function CartPageClient() {
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    isCartEnabled,
    showSuccessToast,
    showErrorToast,
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout() {
    if (isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/orders/checkout', { method: 'POST' });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = data.message ?? 'Unable to complete checkout. Please try again.';
        setCheckoutError(message);
        showErrorToast(message);
        return;
      }

      clearCart();
      showSuccessToast('Checkout completed successfully');
      router.push('/profile?tab=orders');
    } catch {
      const message = 'Unable to connect. Please try again.';
      setCheckoutError(message);
      showErrorToast(message);
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (!isCartEnabled) {
    return (
      <div className='mx-auto w-full px-4 py-16'>
        <div className='mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-8 text-center'>
          <h2 className='text-2xl font-bold'>Cart unavailable</h2>
          <p className='text-muted-foreground'>
            Only purchaser accounts can use the shopping cart and checkout.
          </p>
          <div className='flex items-center justify-center gap-3'>
            <Link
              href='/profile'
              className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
            >
              Go to Profile
            </Link>
            <Link
              href='/'
              className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
            >
              Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 75 ? 0 : 8.99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className='mx-auto w-full px-4 py-16'>
        <div className='mx-auto max-w-md space-y-6 text-center'>
          <div className='inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted'>
            <ShoppingBag className='h-12 w-12 text-muted-foreground/70' />
          </div>
          <h2 className='text-2xl font-bold'>Your cart is empty</h2>
          <p className='text-muted-foreground'>
            Looks like you haven&apos;t added anything to your cart yet. Start shopping to find
            amazing handcrafted items!
          </p>
          <Link
            href='/shop'
            className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>Shopping Cart</h1>

      <div className='grid gap-8 lg:grid-cols-3'>
        <div className='space-y-4 lg:col-span-2'>
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className='flex gap-4 rounded-lg border border-border bg-card p-4'
            >
              <div className='flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted'>
                {item.product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <span className='text-xs font-medium text-muted-foreground'>No image</span>
                )}
              </div>

              <div className='flex-1 space-y-2'>
                <div className='flex justify-between gap-3'>
                  <div>
                    <Link
                      href={`/shop/${item.product.id}`}
                      className='font-semibold hover:text-amber-600'
                    >
                      {item.product.name}
                    </Link>
                    <p className='text-sm text-muted-foreground'>
                      by {item.product.artisanName?.trim() || 'Unknown artisan'}
                    </p>
                  </div>

                  <button
                    type='button'
                    className='inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent'
                    onClick={() => removeFromCart(item.product.id)}
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <Trash2 className='h-4 w-4 text-red-500' />
                  </button>
                </div>

                {item.customization && (
                  <div className='rounded bg-muted p-2 text-sm text-muted-foreground'>
                    <span className='font-medium'>Customization:</span> {item.customization}
                  </div>
                )}

                <div className='flex items-center justify-between'>
                  <div className='flex items-center rounded-md border'>
                    <button
                      type='button'
                      className='inline-flex h-9 w-9 items-center justify-center rounded-l-md transition-colors hover:bg-accent'
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.product.name}`}
                    >
                      <Minus className='h-4 w-4' />
                    </button>
                    <span className='px-4 text-sm'>{item.quantity}</span>
                    <button
                      type='button'
                      className='inline-flex h-9 w-9 items-center justify-center rounded-r-md transition-colors hover:bg-accent'
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.product.name}`}
                    >
                      <Plus className='h-4 w-4' />
                    </button>
                  </div>
                  <p className='font-semibold'>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className='flex items-center justify-between pt-4'>
            <button
              type='button'
              className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
              onClick={clearCart}
            >
              Clear Cart
            </button>
            <Link
              href='/shop'
              className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className='lg:col-span-1'>
          <div className='sticky top-24 space-y-4 rounded-lg border border-border bg-card p-6'>
            <h2 className='text-xl font-bold'>Order Summary</h2>

            <hr className='border-border' />

            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {subtotal < 75 && (
                <p className='text-sm text-amber-600'>
                  Add ${(75 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
            </div>

            <hr className='border-border' />

            <div className='flex justify-between text-lg font-bold'>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              type='button'
              className='inline-flex h-11 w-full items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60'
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'Processing checkout...' : 'Proceed to Checkout'}
            </button>

            {checkoutError && <p className='text-sm text-red-600'>{checkoutError}</p>}

            <div className='space-y-2 text-sm text-muted-foreground'>
              <p className='flex items-center'>
                <span className='mr-2'>✓</span>
                Secure checkout
              </p>
              <p className='flex items-center'>
                <span className='mr-2'>✓</span>
                30-day return policy
              </p>
              <p className='flex items-center'>
                <span className='mr-2'>✓</span>
                Direct support from artisans
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
