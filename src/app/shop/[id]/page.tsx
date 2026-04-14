'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { Product } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';

type Params = {
  params: Promise<{ id: string }>;
};

type ReviewViewModel = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

type ReviewEligibility = {
  isPurchaser: boolean;
  hasPurchasedProduct: boolean;
  hasOwnReview: boolean;
  canCreateReview: boolean;
};

type SessionUser = {
  id: string;
  role: 'purchaser' | 'artisan' | 'admin';
  name: string;
};

const DEFAULT_REVIEW_ELIGIBILITY: ReviewEligibility = {
  isPurchaser: false,
  hasPurchasedProduct: false,
  hasOwnReview: false,
  canCreateReview: false,
};

async function fetchProductById(productId: string) {
  const response = await fetch('/api/products', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = (await response.json()) as { products?: Product[] };
  const selectedProduct = (data.products ?? []).find((product) => product._id === productId);
  return selectedProduct ?? null;
}

async function fetchReviewsByProductId(productId: string) {
  const response = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }

  const data = (await response.json()) as {
    reviews?: ReviewViewModel[];
    viewer?: ReviewEligibility;
  };

  return {
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    viewer: data.viewer ?? {
      isPurchaser: false,
      hasPurchasedProduct: false,
      hasOwnReview: false,
      canCreateReview: false,
    },
  };
}

export default function ProductDetailPage({ params }: Params) {
  const { addToCart, isCartEnabled, isInWishlist, toggleWishlist, showSuccessToast } = useCart();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ReviewViewModel[]>([]);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [reviewEligibility, setReviewEligibility] = useState<ReviewEligibility>({
    ...DEFAULT_REVIEW_ELIGIBILITY,
  });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewActionError, setReviewActionError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setReviews([]);
    setReviewEligibility(DEFAULT_REVIEW_ELIGIBILITY);
    setReviewsError(null);
    setReviewActionError(null);
    setEditingReviewId(null);
    setReviewComment('');
    setReviewRating(5);

    async function fetchData() {
      try {
        const [selectedProduct, productReviewData, userResponse] = await Promise.all([
          fetchProductById(id),
          fetchReviewsByProductId(id),
          fetch('/api/users/me', { cache: 'no-store' }).catch(() => null),
        ]);

        if (!selectedProduct) {
          setError('Product not found');
        } else {
          setProduct(selectedProduct);
          setError(null);
        }

        setReviews(productReviewData.reviews);
        setReviewEligibility(productReviewData.viewer);
        setReviewsError(null);

        if (userResponse?.ok) {
          const userData = (await userResponse.json()) as { user?: SessionUser };
          setCurrentUser(userData.user ?? null);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
        setReviews([]);
        setReviewEligibility(DEFAULT_REVIEW_ELIGIBILITY);
        setReviewsError('Unable to load reviews right now');
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [id]);

  async function refreshProductAndReviews() {
    try {
      const [selectedProduct, productReviewData] = await Promise.all([
        fetchProductById(id),
        fetchReviewsByProductId(id),
      ]);

      if (selectedProduct) {
        setProduct(selectedProduct);
      }

      setReviews(productReviewData.reviews);
      setReviewEligibility(productReviewData.viewer);
      setReviewsError(null);
    } catch {
      setReviewsError('Unable to refresh reviews right now');
    }
  }

  const ownReview = currentUser ? reviews.find((review) => review.userId === currentUser.id) : null;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  async function handleReviewSubmit() {
    if (!currentUser || currentUser.role !== 'purchaser') {
      setReviewActionError('Sign in as a purchaser to submit a review');
      return;
    }

    const trimmedComment = reviewComment.trim();
    if (trimmedComment.length < 3) {
      setReviewActionError('Please write at least 3 characters in your review');
      return;
    }

    setIsSubmittingReview(true);
    setReviewActionError(null);

    try {
      const isEditing = Boolean(editingReviewId);
      const endpoint = isEditing ? `/api/reviews/${editingReviewId}` : '/api/reviews';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isEditing
            ? {
                rating: reviewRating,
                comment: trimmedComment,
              }
            : {
                productId: id,
                rating: reviewRating,
                comment: trimmedComment,
              }
        ),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setReviewActionError(data.message ?? 'Unable to save review');
        return;
      }

      setReviewComment('');
      setReviewRating(5);
      setEditingReviewId(null);

      await refreshProductAndReviews();

      showSuccessToast(isEditing ? 'Review updated successfully' : 'Review submitted successfully');
    } catch {
      setReviewActionError('Unable to save review');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!currentUser || currentUser.role !== 'purchaser') {
      setReviewActionError('Unauthorized');
      return;
    }

    setReviewActionError(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setReviewActionError(data.message ?? 'Unable to delete review');
        return;
      }

      setEditingReviewId(null);
      setReviewComment('');
      setReviewRating(5);

      await refreshProductAndReviews();
      showSuccessToast('Review deleted successfully');
    } catch {
      setReviewActionError('Unable to delete review');
    }
  }

  function beginReviewEdit(review: ReviewViewModel) {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    setReviewActionError(null);
  }

  if (loading) {
    return (
      <main className='mx-auto max-w-6xl px-4 py-12'>
        <p className='text-slate-600'>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className='mx-auto max-w-6xl space-y-4 px-4 py-12'>
        <p className='text-red-600'>{error}</p>
        <Link href='/shop' className='inline-block text-sm text-slate-700 hover:underline'>
          Back to shop
        </Link>
      </main>
    );
  }

  if (!product) {
    return (
      <main className='mx-auto max-w-6xl space-y-4 px-4 py-12'>
        <p className='text-slate-700'>Product not found.</p>
        <Link href='/shop' className='inline-block text-sm text-slate-700 hover:underline'>
          Back to shop
        </Link>
      </main>
    );
  }

  const stockQuantity = Number(product.stockQuantity ?? (product.inStock ? 1 : 0));
  const isOutOfStock = stockQuantity < 1;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;
  const priceLabel = `$${product.price.toFixed(2)}`;

  return (
    <main className='mx-auto max-w-6xl px-4 py-12'>
      {product && (
        <div className='space-y-8'>
          <section className='grid gap-8 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:grid-cols-2 md:p-6'>
            <div className='relative aspect-square overflow-hidden rounded-xl bg-slate-100'>
              <Image
                src={product.image || '/images/product-placeholder.webp'}
                alt={product.name}
                fill
                unoptimized
                className='object-cover'
                sizes='(max-width: 768px) 100vw, 50vw'
              />
            </div>
            <div className='space-y-4'>
              <p className='text-sm text-slate-500'>Shop / {product.category}</p>
              <h1 className='text-3xl font-semibold tracking-tight'>{product.name}</h1>
              <p className='text-slate-700'>{product.description}</p>
              <p className='text-2xl font-bold text-slate-700'>{priceLabel}</p>
              {isLowStock && (
                <p className='text-sm font-semibold text-amber-700'>Only {stockQuantity} left</p>
              )}
              {isCartEnabled && (
                <>
                  <button
                    className='inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300'
                    type='button'
                    onClick={() =>
                      addToCart({
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        artisanName: product.artisanName,
                        stockQuantity,
                      })
                    }
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    className='inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
                    type='button'
                    onClick={() =>
                      toggleWishlist({
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        artisanName: product.artisanName,
                        stockQuantity,
                      })
                    }
                  >
                    <Heart className='mr-2 inline h-4 w-4' />
                    {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                </>
              )}
              <Link href='/shop' className='inline-block text-sm text-slate-700 hover:underline'>
                Back to Marketplace
              </Link>
            </div>
          </section>

          <section className='space-y-5 rounded-xl border bg-white p-4 shadow-sm md:p-6'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <h2 className='text-2xl font-semibold'>Reviews</h2>
              <div className='inline-flex items-center gap-2 text-sm text-slate-600'>
                <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
                <span>{averageRating.toFixed(1)}</span>
                <span>({reviews.length} reviews)</span>
              </div>
            </div>

            {reviewsError && <p className='text-sm text-red-600'>{reviewsError}</p>}

            {currentUser?.role === 'purchaser' &&
              (editingReviewId || (!ownReview && reviewEligibility.canCreateReview)) && (
                <div className='space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4'>
                  <h3 className='font-medium'>
                    {editingReviewId ? 'Edit your review' : 'Write a review'}
                  </h3>

                  <label className='flex items-center gap-2 text-sm text-slate-700'>
                    Rating
                    <select
                      className='rounded-md border border-slate-300 bg-white px-2 py-1 text-sm'
                      value={reviewRating}
                      onChange={(event) => setReviewRating(Number(event.target.value))}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} star{value === 1 ? '' : 's'}
                        </option>
                      ))}
                    </select>
                  </label>

                  <textarea
                    className='min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-amber-500/30'
                    placeholder='Share your experience with this product...'
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                  />

                  {reviewActionError && <p className='text-sm text-red-600'>{reviewActionError}</p>}

                  <div className='flex flex-wrap items-center gap-2'>
                    <button
                      type='button'
                      className='inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300'
                      onClick={handleReviewSubmit}
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview
                        ? 'Saving...'
                        : editingReviewId
                          ? 'Update Review'
                          : 'Submit Review'}
                    </button>

                    {editingReviewId && (
                      <button
                        type='button'
                        className='inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
                        onClick={() => {
                          setEditingReviewId(null);
                          setReviewComment('');
                          setReviewRating(5);
                          setReviewActionError(null);
                        }}
                        disabled={isSubmittingReview}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

            {currentUser?.role === 'purchaser' && ownReview && !editingReviewId && (
              <p className='text-sm text-slate-600'>
                You already reviewed this product. You can edit or delete your review below.
              </p>
            )}

            {currentUser?.role === 'purchaser' &&
              !ownReview &&
              !editingReviewId &&
              !reviewEligibility.canCreateReview &&
              !reviewEligibility.hasPurchasedProduct && (
                <p className='text-sm text-slate-600'>
                  You can review this product after it has been delivered.
                </p>
              )}

            {reviews.length === 0 ? (
              <p className='text-sm text-slate-600'>No reviews yet. Be the first to review.</p>
            ) : (
              <div className='space-y-3'>
                {reviews.map((review) => {
                  const canModify =
                    currentUser?.role === 'purchaser' && currentUser.id === review.userId;

                  return (
                    <article key={review.id} className='rounded-lg border border-slate-200 p-4'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div>
                          <p className='font-medium text-slate-900'>{review.userName}</p>
                          <p className='text-xs text-slate-500'>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className='flex items-center gap-1'>
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={`${review.id}-${index}`}
                              className={`h-4 w-4 ${
                                index < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className='mt-3 whitespace-pre-line text-sm text-slate-700'>
                        {review.comment}
                      </p>

                      {canModify && (
                        <div className='mt-3 flex items-center gap-2'>
                          <button
                            type='button'
                            className='inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50'
                            onClick={() => beginReviewEdit(review)}
                          >
                            Edit
                          </button>
                          <button
                            type='button'
                            className='inline-flex items-center justify-center rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50'
                            onClick={() => void handleDeleteReview(review.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
