'use client';

import Link from 'next/link';
import { Heart, LogOut, Package, Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';

type TabKey = 'profile' | 'orders' | 'products' | 'wishlist' | 'settings';
type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'purchaser' | 'artisan';
  phone?: string;
};

type OrderItem = {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
};

type ArtisanProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  inStock: boolean;
};

const baseTabs: Array<{ key: TabKey; label: string; icon: typeof User }> = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ArtisanProduct[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productInStock, setProductInStock] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSuccess, setProductSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch('/api/users/me', { cache: 'no-store' });
        if (!isMounted) return;

        if (!response.ok) {
          setAuthUser(null);
          return;
        }

        const data = (await response.json()) as { user: AuthUser };
        setAuthUser(data.user);
      } catch {
        if (isMounted) setAuthUser(null);
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    }

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const splitName = authUser.name.split(' ');
    setFirstName(splitName[0] ?? '');
    setLastName(splitName.slice(1).join(' '));
    setEmail(authUser.email);
    setPhone(authUser.phone ?? '');
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    const currentUser = authUser;

    async function loadRoleData() {
      if (currentUser.role === 'purchaser') {
        setIsLoadingOrders(true);
        setOrdersError(null);
        try {
          const response = await fetch('/api/orders/me', { cache: 'no-store' });
          const data = (await response.json()) as { message?: string; orders?: OrderItem[] };

          if (!response.ok) {
            setOrdersError(data.message ?? 'Unable to load your orders');
            setOrders([]);
            return;
          }

          setOrders(data.orders ?? []);
        } catch {
          setOrdersError('Unable to connect. Please try again.');
          setOrders([]);
        } finally {
          setIsLoadingOrders(false);
        }
      }

      if (currentUser.role === 'artisan') {
        setIsLoadingProducts(true);
        setProductsError(null);
        try {
          const response = await fetch('/api/products/me', { cache: 'no-store' });
          const data = (await response.json()) as {
            message?: string;
            products?: ArtisanProduct[];
          };

          if (!response.ok) {
            setProductsError(data.message ?? 'Unable to load your products');
            setProducts([]);
            return;
          }

          setProducts(data.products ?? []);
        } catch {
          setProductsError('Unable to connect. Please try again.');
          setProducts([]);
        } finally {
          setIsLoadingProducts(false);
        }
      }
    }

    loadRoleData();
  }, [authUser]);

  async function handleLogout() {
    await fetch('/api/users/logout', { method: 'POST' });
    setAuthUser(null);
  }

  async function handleSaveProfile() {
    setSaveError(null);
    setSaveSuccess(null);

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!fullName || !email.trim()) {
      setSaveError('Name and email are required.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const data = (await response.json()) as { message?: string; user?: AuthUser };

      if (!response.ok || !data.user) {
        setSaveError(data.message ?? 'Unable to save profile changes');
        return;
      }

      setAuthUser(data.user);
      setSaveSuccess('Profile updated successfully.');
    } catch {
      setSaveError('Unable to connect. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  function resetProductForm() {
    setProductId(null);
    setProductName('');
    setProductDescription('');
    setProductCategory('');
    setProductImage('');
    setProductPrice('');
    setProductInStock(true);
  }

  function startProductEdit(product: ArtisanProduct) {
    setProductId(product.id);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductCategory(product.category);
    setProductImage(product.image);
    setProductPrice(String(product.price));
    setProductInStock(product.inStock);
    setProductSuccess(null);
    setProductsError(null);
    setActiveTab('products');
  }

  async function handleSaveProduct() {
    setProductsError(null);
    setProductSuccess(null);

    const parsedPrice = Number(productPrice);
    if (
      productName.trim().length < 2 ||
      productDescription.trim().length < 10 ||
      productCategory.trim().length < 2 ||
      !productImage.trim() ||
      Number.isNaN(parsedPrice) ||
      parsedPrice < 0
    ) {
      setProductsError('Please complete all product fields with valid values.');
      return;
    }

    setIsSavingProduct(true);

    try {
      const response = await fetch('/api/products/me', {
        method: productId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(productId ? { id: productId } : {}),
          name: productName.trim(),
          description: productDescription.trim(),
          category: productCategory.trim(),
          image: productImage.trim(),
          price: parsedPrice,
          inStock: productInStock,
        }),
      });

      const data = (await response.json()) as { message?: string; product?: ArtisanProduct };

      if (!response.ok || !data.product) {
        setProductsError(data.message ?? 'Unable to save product');
        return;
      }

      if (productId) {
        setProducts((prev) =>
          prev.map((item) => (item.id === data.product!.id ? data.product! : item))
        );
        setProductSuccess('Product updated successfully.');
      } else {
        setProducts((prev) => [data.product!, ...prev]);
        setProductSuccess('Product created successfully.');
      }

      resetProductForm();
    } catch {
      setProductsError('Unable to connect. Please try again.');
    } finally {
      setIsSavingProduct(false);
    }
  }

  const userRole = authUser?.role;

  const tabs: Array<{ key: TabKey; label: string; icon: typeof User }> =
    userRole === 'purchaser'
      ? [baseTabs[0], { key: 'orders', label: 'Orders', icon: Package }, baseTabs[1], baseTabs[2]]
      : [
          baseTabs[0],
          { key: 'products', label: 'Products', icon: Package },
          baseTabs[1],
          baseTabs[2],
        ];

  const tabButtonClasses = (key: TabKey) =>
    [
      'inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
      activeTab === key
        ? 'bg-foreground text-background'
        : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    ].join(' ');

  if (isLoadingUser) {
    return (
      <div className='mx-auto w-full max-w-3xl px-4 py-16 text-center text-muted-foreground'>
        Loading profile...
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className='mx-auto w-full max-w-xl px-4 py-16'>
        <section className='rounded-lg border border-border bg-card p-6 text-center'>
          <h1 className='text-2xl font-semibold'>You are not signed in</h1>
          <p className='mt-2 text-muted-foreground'>
            Sign in or create an account to access your profile.
          </p>
          <div className='mt-6 flex items-center justify-center gap-3'>
            <Link
              href='/login'
              className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
            >
              Sign in
            </Link>
            <Link
              href='/signup'
              className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
            >
              Sign up
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full px-4 py-8'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-8 flex items-center justify-between gap-4'>
          <div className='flex items-center space-x-4'>
            <div className='inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl font-semibold text-amber-700'>
              {authUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className='text-3xl font-bold'>{authUser.name}</h1>
              <p className='text-muted-foreground'>{authUser.email}</p>
              <p className='text-sm text-muted-foreground'>
                Account type: <span className='font-medium capitalize'>{authUser.role}</span>
              </p>
            </div>
          </div>
          <div>
            <button
              type='button'
              onClick={handleLogout}
              className='inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
            >
              <LogOut className='h-4 w-4' />
              Logout
            </button>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='grid w-full grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-2 sm:grid-cols-4'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type='button'
                  className={tabButtonClasses(tab.key)}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon className='h-4 w-4' />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'profile' && (
            <section className='rounded-lg border border-border bg-card'>
              <header className='space-y-1 border-b border-border p-6'>
                <h2 className='text-xl font-bold'>Profile Information</h2>
                <p className='text-sm text-muted-foreground'>
                  Update your account details and personal information
                </p>
              </header>
              <div className='space-y-4 p-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <label htmlFor='firstName' className='text-sm font-medium'>
                      First Name
                    </label>
                    <input
                      id='firstName'
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label htmlFor='lastName' className='text-sm font-medium'>
                      Last Name
                    </label>
                    <input
                      id='lastName'
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label htmlFor='email' className='text-sm font-medium'>
                    Email
                  </label>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                  />
                </div>

                <div className='space-y-2'>
                  <label htmlFor='phone' className='text-sm font-medium'>
                    Phone
                  </label>
                  <input
                    id='phone'
                    type='tel'
                    placeholder='+1 (555) 000-0000'
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                  />
                </div>

                {saveError && <p className='text-sm text-destructive'>{saveError}</p>}
                {saveSuccess && <p className='text-sm text-green-600'>{saveSuccess}</p>}

                <button
                  type='button'
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </section>
          )}

          {activeTab === 'orders' && authUser.role === 'purchaser' && (
            <section className='rounded-lg border border-border bg-card'>
              <header className='space-y-1 border-b border-border p-6'>
                <h2 className='text-xl font-bold'>Order History</h2>
                <p className='text-sm text-muted-foreground'>View and track your previous orders</p>
              </header>
              <div className='space-y-4 p-6'>
                {isLoadingOrders && (
                  <p className='text-sm text-muted-foreground'>Loading orders...</p>
                )}
                {!isLoadingOrders && ordersError && (
                  <p className='text-sm text-destructive'>{ordersError}</p>
                )}
                {!isLoadingOrders && !ordersError && orders.length === 0 && (
                  <p className='text-sm text-muted-foreground'>No orders found yet.</p>
                )}
                {!isLoadingOrders &&
                  !ordersError &&
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className='flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-md'
                    >
                      <div className='space-y-1'>
                        <p className='font-semibold'>Order #{order.id.slice(-6).toUpperCase()}</p>
                        <p className='text-sm text-muted-foreground'>
                          {new Date(order.date).toLocaleDateString()} - {order.items}{' '}
                          {order.items === 1 ? 'item' : 'items'}
                        </p>
                        <p className='text-sm'>
                          <span className='font-medium'>Status:</span>{' '}
                          <span className='text-green-600'>{order.status}</span>
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-lg font-bold'>${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {activeTab === 'products' && authUser.role === 'artisan' && (
            <section className='rounded-lg border border-border bg-card'>
              <header className='space-y-1 border-b border-border p-6'>
                <h2 className='text-xl font-bold'>My Products</h2>
                <p className='text-sm text-muted-foreground'>Create and manage items for sale</p>
              </header>
              <div className='space-y-6 p-6'>
                <div className='space-y-4 rounded-lg border border-border bg-background p-4'>
                  <h3 className='font-semibold'>
                    {productId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <label htmlFor='productName' className='text-sm font-medium'>
                        Name
                      </label>
                      <input
                        id='productName'
                        value={productName}
                        onChange={(event) => setProductName(event.target.value)}
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='productCategory' className='text-sm font-medium'>
                        Category
                      </label>
                      <input
                        id='productCategory'
                        value={productCategory}
                        onChange={(event) => setProductCategory(event.target.value)}
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <label htmlFor='productDescription' className='text-sm font-medium'>
                      Description
                    </label>
                    <textarea
                      id='productDescription'
                      rows={4}
                      value={productDescription}
                      onChange={(event) => setProductDescription(event.target.value)}
                      className='w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                    />
                  </div>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <label htmlFor='productImage' className='text-sm font-medium'>
                        Image URL
                      </label>
                      <input
                        id='productImage'
                        value={productImage}
                        onChange={(event) => setProductImage(event.target.value)}
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='productPrice' className='text-sm font-medium'>
                        Price
                      </label>
                      <input
                        id='productPrice'
                        type='number'
                        min='0'
                        step='0.01'
                        value={productPrice}
                        onChange={(event) => setProductPrice(event.target.value)}
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      />
                    </div>
                  </div>
                  <label className='inline-flex items-center gap-2 text-sm text-foreground'>
                    <input
                      type='checkbox'
                      checked={productInStock}
                      onChange={(event) => setProductInStock(event.target.checked)}
                      className='h-4 w-4 rounded border-border'
                    />
                    In stock
                  </label>

                  {productsError && <p className='text-sm text-destructive'>{productsError}</p>}
                  {productSuccess && <p className='text-sm text-green-600'>{productSuccess}</p>}

                  <div className='flex items-center gap-3'>
                    <button
                      type='button'
                      onClick={handleSaveProduct}
                      disabled={isSavingProduct}
                      className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
                    >
                      {isSavingProduct
                        ? 'Saving...'
                        : productId
                          ? 'Update Product'
                          : 'Create Product'}
                    </button>
                    {productId && (
                      <button
                        type='button'
                        onClick={resetProductForm}
                        className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold'>Current Listings</h3>
                  {isLoadingProducts && (
                    <p className='text-sm text-muted-foreground'>Loading your products...</p>
                  )}
                  {!isLoadingProducts && products.length === 0 && !productsError && (
                    <p className='text-sm text-muted-foreground'>
                      No products yet. Add your first listing above.
                    </p>
                  )}
                  {!isLoadingProducts &&
                    products.map((product) => (
                      <article
                        key={product.id}
                        className='flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4'
                      >
                        <div className='space-y-1'>
                          <p className='font-semibold'>{product.name}</p>
                          <p className='text-sm text-muted-foreground'>{product.category}</p>
                          <p className='max-w-xl text-sm text-muted-foreground'>
                            {product.description}
                          </p>
                          <p className='text-sm font-medium'>${product.price.toFixed(2)}</p>
                          <p className='text-xs text-muted-foreground'>
                            {product.inStock ? 'In stock' : 'Out of stock'}
                          </p>
                        </div>
                        <button
                          type='button'
                          onClick={() => startProductEdit(product)}
                          className='inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent'
                        >
                          Edit
                        </button>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'wishlist' && (
            <section className='rounded-lg border border-border bg-card'>
              <header className='space-y-1 border-b border-border p-6'>
                <h2 className='text-xl font-bold'>Wishlist</h2>
                <p className='text-sm text-muted-foreground'>Items you&apos;ve saved for later</p>
              </header>
              <div className='py-12 text-center text-muted-foreground'>
                <Heart className='mx-auto mb-4 h-12 w-12 opacity-20' />
                <p>Your wishlist is empty</p>
                <p className='mt-2 text-sm'>Save items you love to find them easily later!</p>
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className='rounded-lg border border-border bg-card'>
              <header className='space-y-1 border-b border-border p-6'>
                <h2 className='text-xl font-bold'>Account Settings</h2>
                <p className='text-sm text-muted-foreground'>
                  Manage your account preferences and security
                </p>
              </header>
              <div className='space-y-6 p-6'>
                <div>
                  <h3 className='mb-4 font-semibold'>Change Password</h3>
                  <div className='max-w-md space-y-4'>
                    <div className='space-y-2'>
                      <label htmlFor='currentPassword' className='text-sm font-medium'>
                        Current Password
                      </label>
                      <input
                        id='currentPassword'
                        type='password'
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='newPassword' className='text-sm font-medium'>
                        New Password
                      </label>
                      <input
                        id='newPassword'
                        type='password'
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='confirmPassword' className='text-sm font-medium'>
                        Confirm New Password
                      </label>
                      <input
                        id='confirmPassword'
                        type='password'
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      />
                    </div>
                    <button
                      type='button'
                      className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                <div className='border-t border-border pt-6'>
                  <h3 className='mb-4 font-semibold'>Email Preferences</h3>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Newsletter</p>
                        <p className='text-sm text-muted-foreground'>
                          Receive updates about new products and artisans
                        </p>
                      </div>
                      <button
                        type='button'
                        className='inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent'
                      >
                        Subscribed
                      </button>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Order Updates</p>
                        <p className='text-sm text-muted-foreground'>
                          Get notified about your order status
                        </p>
                      </div>
                      <button
                        type='button'
                        className='inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent'
                      >
                        Enabled
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
