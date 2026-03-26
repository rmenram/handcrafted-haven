'use client';

import Link from 'next/link';
import { Heart, LogOut, Package, Settings, Tags, User, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type TabKey =
  | 'profile'
  | 'orders'
  | 'products'
  | 'users'
  | 'categories'
  | 'wishlist'
  | 'settings';
type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'purchaser' | 'artisan' | 'admin';
  phone?: string;
  profileImage?: string;
  location?: string;
  bio?: string;
  specialties?: string[];
  memberSince?: string | null;
  artisanRating?: number;
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
  featured: boolean;
  artisanName?: string;
  rating?: number;
  reviewCount?: number;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'purchaser' | 'artisan' | 'admin';
  phone?: string;
  profileImage?: string;
  location?: string;
  bio?: string;
  specialties?: string[];
  memberSince?: string | null;
  artisanRating?: number;
};

type AdminCategory = {
  name: string;
  productCount: number;
};

const baseTabs: Array<{ key: TabKey; label: string; icon: typeof User }> = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const productCategories = [
  'Home Decor',
  'Jewelry',
  'Kitchen',
  'Pottery & Ceramics',
  'Stationery',
  'Textiles & Fabrics',
] as const;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
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
  const [productCategory, setProductCategory] = useState<string>(productCategories[0]);
  const [productImage, setProductImage] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productInStock, setProductInStock] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingFeaturedProducts, setIsSavingFeaturedProducts] = useState(false);
  const [selectedFeaturedProductIds, setSelectedFeaturedProductIds] = useState<string[]>([]);
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');
  const [productSuccess, setProductSuccess] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);
  const [adminUserSuccess, setAdminUserSuccess] = useState<string | null>(null);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>([]);
  const [isLoadingAdminCategories, setIsLoadingAdminCategories] = useState(false);
  const [adminCategoriesError, setAdminCategoriesError] = useState<string | null>(null);
  const [adminCategorySuccess, setAdminCategorySuccess] = useState<string | null>(null);
  const [categorySourceName, setCategorySourceName] = useState('');
  const [categoryTargetName, setCategoryTargetName] = useState('');
  const [categoryAction, setCategoryAction] = useState<'rename' | 'delete'>('rename');
  const [isSavingCategoryAction, setIsSavingCategoryAction] = useState(false);
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');

  const filteredAdminProducts = useMemo(() => {
    const searchTerm = adminProductSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        adminCategoryFilter === 'all' || product.category === adminCategoryFilter;

      if (!searchTerm) {
        return matchesCategory;
      }

      return (
        matchesCategory &&
        [product.name, product.description, product.category, product.artisanName]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(searchTerm))
      );
    });
  }, [products, adminCategoryFilter, adminProductSearch]);

  const filteredAdminUsers = useMemo(() => {
    const searchTerm = adminUserSearch.trim().toLowerCase();

    if (!searchTerm) {
      return adminUsers;
    }

    return adminUsers.filter((user) =>
      [user.name, user.email, user.role, user.location]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(searchTerm))
    );
  }, [adminUsers, adminUserSearch]);

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
    setProfileImage(authUser.profileImage ?? '');
    setLocation(authUser.location ?? '');
    setBio(authUser.bio ?? '');
    setSpecialties((authUser.specialties ?? []).join(', '));
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

      if (currentUser.role === 'admin') {
        setIsLoadingProducts(true);
        setIsLoadingAdminUsers(true);
        setIsLoadingAdminCategories(true);
        setProductsError(null);
        setAdminUsersError(null);
        setAdminCategoriesError(null);
        setProductSuccess(null);
        try {
          const [productsResponse, usersResponse, categoriesResponse] = await Promise.all([
            fetch('/api/products/featured', { cache: 'no-store' }),
            fetch('/api/admin/users', { cache: 'no-store' }),
            fetch('/api/admin/categories', { cache: 'no-store' }),
          ]);

          const productsData = (await productsResponse.json()) as {
            message?: string;
            products?: ArtisanProduct[];
          };
          const usersData = (await usersResponse.json()) as {
            message?: string;
            users?: AdminUser[];
          };
          const categoriesData = (await categoriesResponse.json()) as {
            message?: string;
            categories?: AdminCategory[];
          };

          if (!productsResponse.ok) {
            setProductsError(productsData.message ?? 'Unable to load products');
            setProducts([]);
            setSelectedFeaturedProductIds([]);
          }

          if (!usersResponse.ok) {
            setAdminUsersError(usersData.message ?? 'Unable to load users');
            setAdminUsers([]);
          }

          if (!categoriesResponse.ok) {
            setAdminCategoriesError(categoriesData.message ?? 'Unable to load categories');
            setAdminCategories([]);
          }

          const loadedProducts = productsData.products ?? [];
          setProducts(loadedProducts);
          setSelectedFeaturedProductIds(
            loadedProducts.filter((product) => product.featured).map((product) => product.id)
          );

          const loadedUsers = usersData.users ?? [];
          setAdminUsers(loadedUsers);

          const loadedCategories = categoriesData.categories ?? [];
          setAdminCategories(loadedCategories);

          if (loadedCategories.length > 0) {
            setCategorySourceName((current) => current || loadedCategories[0].name);
            setCategoryTargetName((current) => current || loadedCategories[0].name);
          }
        } catch {
          setProductsError('Unable to connect. Please try again.');
          setAdminUsersError('Unable to connect. Please try again.');
          setAdminCategoriesError('Unable to connect. Please try again.');
          setProducts([]);
          setAdminUsers([]);
          setAdminCategories([]);
          setSelectedFeaturedProductIds([]);
        } finally {
          setIsLoadingProducts(false);
          setIsLoadingAdminUsers(false);
          setIsLoadingAdminCategories(false);
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
          profileImage: profileImage.trim(),
          location: location.trim(),
          bio: bio.trim(),
          specialties: specialties
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
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
    setProductCategory(productCategories[0]);
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
      if (authUser?.role === 'admin' && !productId) {
        setProductsError('Select a product to edit. Admins can update existing products only.');
        setIsSavingProduct(false);
        return;
      }

      const endpoint =
        authUser?.role === 'admin' && productId
          ? `/api/products/admin/${productId}`
          : '/api/products/me';
      const method = authUser?.role === 'admin' ? 'PATCH' : productId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(authUser?.role !== 'admin' && productId ? { id: productId } : {}),
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

  async function handleSaveFeaturedProducts() {
    setProductsError(null);
    setProductSuccess(null);
    setIsSavingFeaturedProducts(true);

    try {
      const response = await fetch('/api/products/featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedFeaturedProductIds }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setProductsError(data.message ?? 'Unable to update featured products');
        return;
      }

      setProducts((prev) =>
        prev.map((product) => ({
          ...product,
          featured: selectedFeaturedProductIds.includes(product.id),
        }))
      );
      setProductSuccess('Featured products updated successfully.');
    } catch {
      setProductsError('Unable to connect. Please try again.');
    } finally {
      setIsSavingFeaturedProducts(false);
    }
  }

  async function handleUpdateAdminUserRole(userId: string, role: AuthUser['role']) {
    setAdminUsersError(null);
    setAdminUserSuccess(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });

      const data = (await response.json()) as { message?: string; user?: AdminUser };

      if (!response.ok || !data.user) {
        setAdminUsersError(data.message ?? 'Unable to update user');
        return;
      }

      setAdminUsers((prev) => prev.map((user) => (user.id === userId ? data.user! : user)));
      setAdminUserSuccess('User updated successfully.');
    } catch {
      setAdminUsersError('Unable to connect. Please try again.');
    }
  }

  async function handleSaveCategoryAction() {
    setAdminCategoriesError(null);
    setAdminCategorySuccess(null);

    if (!categorySourceName.trim() || !categoryTargetName.trim()) {
      setAdminCategoriesError('Source and target category names are required.');
      return;
    }

    if (categoryAction === 'rename' && categorySourceName.trim() === categoryTargetName.trim()) {
      setAdminCategoriesError('Choose a different target name when renaming a category.');
      return;
    }

    setIsSavingCategoryAction(true);

    try {
      const payload =
        categoryAction === 'rename'
          ? {
              action: 'rename',
              oldName: categorySourceName.trim(),
              newName: categoryTargetName.trim(),
            }
          : {
              action: 'delete',
              name: categorySourceName.trim(),
              replacementName: categoryTargetName.trim(),
            };

      const response = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        message?: string;
        categories?: AdminCategory[];
      };

      if (!response.ok || !data.categories) {
        setAdminCategoriesError(data.message ?? 'Unable to update categories');
        return;
      }

      setAdminCategories(data.categories);
      setProductSuccess(
        categoryAction === 'rename'
          ? 'Category renamed. Product categories were updated.'
          : 'Category reassigned. Products moved to replacement category.'
      );
      setAdminCategorySuccess('Categories updated successfully.');
    } catch {
      setAdminCategoriesError('Unable to connect. Please try again.');
    } finally {
      setIsSavingCategoryAction(false);
    }
  }

  const userRole = authUser?.role;

  const tabs: Array<{ key: TabKey; label: string; icon: typeof User }> =
    userRole === 'artisan'
      ? [
          baseTabs[0],
          { key: 'products', label: 'Products', icon: Package },
          baseTabs[1],
          baseTabs[2],
        ]
      : userRole === 'admin'
        ? [
            baseTabs[0],
            { key: 'products', label: 'Products', icon: Package },
            { key: 'users', label: 'Users', icon: Users },
            { key: 'categories', label: 'Categories', icon: Tags },
            baseTabs[2],
          ]
        : [
            baseTabs[0],
            { key: 'orders', label: 'Orders', icon: Package },
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
            {profileImage ? (
              <div
                className='h-20 w-20 rounded-full border border-border bg-cover bg-center'
                style={{ backgroundImage: `url(${profileImage})` }}
                role='img'
                aria-label={`${authUser.name} profile picture`}
              />
            ) : (
              <div className='inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl font-semibold text-amber-700'>
                {authUser.name.charAt(0).toUpperCase()}
              </div>
            )}
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
          <div
            className={[
              'grid w-full grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-2',
              tabs.length >= 5 ? 'sm:grid-cols-5' : 'sm:grid-cols-4',
            ].join(' ')}
          >
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

                <div className='space-y-2'>
                  <label htmlFor='profileImage' className='text-sm font-medium'>
                    Profile Picture URL
                  </label>
                  <input
                    id='profileImage'
                    type='url'
                    placeholder='https://example.com/photo.jpg'
                    value={profileImage}
                    onChange={(event) => setProfileImage(event.target.value)}
                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <label htmlFor='location' className='text-sm font-medium'>
                      Location
                    </label>
                    <input
                      id='location'
                      placeholder='Provo, UT'
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label htmlFor='specialties' className='text-sm font-medium'>
                      Specialties (comma separated)
                    </label>
                    <input
                      id='specialties'
                      placeholder='Ceramics, Textiles, Home Decor'
                      value={specialties}
                      onChange={(event) => setSpecialties(event.target.value)}
                      className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label htmlFor='bio' className='text-sm font-medium'>
                    Bio
                  </label>
                  <textarea
                    id='bio'
                    rows={4}
                    placeholder='Share a short story about your craft.'
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    className='w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
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

          {activeTab === 'products' &&
            (authUser.role === 'artisan' || authUser.role === 'admin') && (
              <section className='rounded-lg border border-border bg-card'>
                <header className='space-y-1 border-b border-border p-6'>
                  <h2 className='text-xl font-bold'>My Products</h2>
                  <p className='text-sm text-muted-foreground'>
                    {authUser.role === 'admin'
                      ? 'Manage the full product catalog and choose featured products'
                      : 'Create and manage items for sale'}
                  </p>
                </header>
                {authUser.role === 'admin' ? (
                  <div className='space-y-6 p-6'>
                    <div className='rounded-lg border border-border bg-background p-4'>
                      <h3 className='font-semibold'>Homepage Featured Products</h3>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        Select the products you want to highlight on the homepage.
                      </p>
                      <div className='mt-4 flex items-center gap-3'>
                        <button
                          type='button'
                          onClick={handleSaveFeaturedProducts}
                          disabled={isSavingFeaturedProducts}
                          className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-60'
                        >
                          {isSavingFeaturedProducts ? 'Saving...' : 'Save Featured Selection'}
                        </button>
                        <p className='text-xs text-muted-foreground'>
                          Selected: {selectedFeaturedProductIds.length}
                        </p>
                      </div>
                      {productsError && (
                        <p className='mt-3 text-sm text-destructive'>{productsError}</p>
                      )}
                      {productSuccess && (
                        <p className='mt-3 text-sm text-green-600'>{productSuccess}</p>
                      )}
                    </div>

                    <div className='space-y-4 rounded-lg border border-border bg-background p-4'>
                      <h3 className='font-semibold'>Edit Product Details</h3>
                      <p className='text-sm text-muted-foreground'>
                        Select a product from the list below, then update its details here.
                      </p>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                          <label htmlFor='adminProductName' className='text-sm font-medium'>
                            Name
                          </label>
                          <input
                            id='adminProductName'
                            value={productName}
                            onChange={(event) => setProductName(event.target.value)}
                            className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                          />
                        </div>
                        <div className='space-y-2'>
                          <label htmlFor='adminProductCategory' className='text-sm font-medium'>
                            Category
                          </label>
                          <select
                            id='adminProductCategory'
                            value={productCategory}
                            onChange={(event) => setProductCategory(event.target.value)}
                            className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                          >
                            {productCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <label htmlFor='adminProductDescription' className='text-sm font-medium'>
                          Description
                        </label>
                        <textarea
                          id='adminProductDescription'
                          rows={4}
                          value={productDescription}
                          onChange={(event) => setProductDescription(event.target.value)}
                          className='w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                        />
                      </div>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                          <label htmlFor='adminProductImage' className='text-sm font-medium'>
                            Image URL
                          </label>
                          <input
                            id='adminProductImage'
                            value={productImage}
                            onChange={(event) => setProductImage(event.target.value)}
                            className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                          />
                        </div>
                        <div className='space-y-2'>
                          <label htmlFor='adminProductPrice' className='text-sm font-medium'>
                            Price
                          </label>
                          <input
                            id='adminProductPrice'
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

                      <div className='flex items-center gap-3'>
                        <button
                          type='button'
                          onClick={handleSaveProduct}
                          disabled={isSavingProduct || !productId}
                          className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-60'
                        >
                          {isSavingProduct ? 'Saving...' : 'Save Product Changes'}
                        </button>
                        <button
                          type='button'
                          onClick={resetProductForm}
                          className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <h3 className='font-semibold'>All Products</h3>
                      <div className='grid grid-cols-1 gap-3 rounded-lg border border-border bg-background p-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                          <label htmlFor='adminProductSearch' className='text-sm font-medium'>
                            Search products
                          </label>
                          <input
                            id='adminProductSearch'
                            value={adminProductSearch}
                            onChange={(event) => setAdminProductSearch(event.target.value)}
                            placeholder='Search name, description, artisan...'
                            className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                          />
                        </div>
                        <div className='space-y-2'>
                          <label htmlFor='adminCategoryFilter' className='text-sm font-medium'>
                            Category filter
                          </label>
                          <select
                            id='adminCategoryFilter'
                            value={adminCategoryFilter}
                            onChange={(event) => setAdminCategoryFilter(event.target.value)}
                            className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                          >
                            <option value='all'>All categories</option>
                            {productCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {isLoadingProducts && (
                        <p className='text-sm text-muted-foreground'>Loading products...</p>
                      )}
                      {!isLoadingProducts && products.length === 0 && !productsError && (
                        <p className='text-sm text-muted-foreground'>No products found.</p>
                      )}
                      {!isLoadingProducts &&
                        products.length > 0 &&
                        filteredAdminProducts.length === 0 && (
                          <p className='text-sm text-muted-foreground'>
                            No products match your current filters.
                          </p>
                        )}

                      {!isLoadingProducts &&
                        filteredAdminProducts.map((product) => {
                          const isChecked = selectedFeaturedProductIds.includes(product.id);

                          return (
                            <article
                              key={product.id}
                              className='rounded-lg border border-border bg-background p-4'
                            >
                              <div className='grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto]'>
                                <div className='space-y-1'>
                                  <p className='font-semibold'>{product.name}</p>
                                  <p className='text-sm text-muted-foreground'>
                                    {product.category}
                                    {product.artisanName ? ` - by ${product.artisanName}` : ''}
                                  </p>
                                  <p className='max-w-xl text-sm text-muted-foreground'>
                                    {product.description}
                                  </p>
                                  <p className='text-sm font-medium'>${product.price.toFixed(2)}</p>
                                  <p className='text-xs text-muted-foreground'>
                                    {product.inStock ? 'In stock' : 'Out of stock'}
                                    {typeof product.rating === 'number' &&
                                      typeof product.reviewCount === 'number' &&
                                      ` • ${product.rating.toFixed(1)} (${product.reviewCount} reviews)`}
                                  </p>
                                </div>

                                <label className='inline-flex items-center gap-2 text-sm font-medium'>
                                  <input
                                    type='checkbox'
                                    checked={isChecked}
                                    onChange={(event) => {
                                      setSelectedFeaturedProductIds((prev) => {
                                        if (event.target.checked) {
                                          return [...prev, product.id];
                                        }

                                        return prev.filter((id) => id !== product.id);
                                      });
                                    }}
                                    className='h-4 w-4 rounded border-border'
                                  />
                                  Featured
                                </label>

                                <button
                                  type='button'
                                  onClick={() => startProductEdit(product)}
                                  className='inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent'
                                >
                                  Edit
                                </button>
                              </div>
                            </article>
                          );
                        })}
                    </div>
                  </div>
                ) : (
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
                          <select
                            id='productCategory'
                            value={productCategory}
                            onChange={(event) => setProductCategory(event.target.value)}
                            className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                          >
                            {productCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
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
                              {product.featured && (
                                <p className='text-xs font-medium text-amber-700'>
                                  Featured product
                                </p>
                              )}
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
                )}
              </section>
            )}

          {activeTab === 'users' && authUser.role === 'admin' && (
            <section className='rounded-lg border border-border bg-card'>
              <header className='space-y-1 border-b border-border p-6'>
                <h2 className='text-xl font-bold'>User Management</h2>
                <p className='text-sm text-muted-foreground'>
                  Update account roles and review artisan profile metadata.
                </p>
              </header>
              <div className='space-y-4 p-6'>
                <div className='space-y-2'>
                  <label htmlFor='adminUserSearch' className='text-sm font-medium'>
                    Search users
                  </label>
                  <input
                    id='adminUserSearch'
                    value={adminUserSearch}
                    onChange={(event) => setAdminUserSearch(event.target.value)}
                    placeholder='Search by name, email, role, location...'
                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                  />
                </div>

                {isLoadingAdminUsers && <p className='text-sm text-muted-foreground'>Loading users...</p>}
                {!isLoadingAdminUsers && adminUsersError && (
                  <p className='text-sm text-destructive'>{adminUsersError}</p>
                )}
                {adminUserSuccess && <p className='text-sm text-green-600'>{adminUserSuccess}</p>}

                {!isLoadingAdminUsers &&
                  !adminUsersError &&
                  filteredAdminUsers.map((user) => (
                    <article
                      key={user.id}
                      className='rounded-lg border border-border bg-background p-4'
                    >
                      <div className='grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]'>
                        <div className='space-y-1'>
                          <p className='font-semibold'>{user.name}</p>
                          <p className='text-sm text-muted-foreground'>{user.email}</p>
                          <p className='text-sm text-muted-foreground'>
                            {user.location || 'No location'}
                            {typeof user.artisanRating === 'number' &&
                              user.artisanRating > 0 &&
                              ` • Rating ${user.artisanRating.toFixed(1)}`}
                          </p>
                          {Array.isArray(user.specialties) && user.specialties.length > 0 && (
                            <p className='text-xs text-muted-foreground'>
                              Specialties: {user.specialties.join(', ')}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <label
                            htmlFor={`role-${user.id}`}
                            className='text-xs font-medium uppercase tracking-wide text-muted-foreground'
                          >
                            Role
                          </label>
                          <select
                            id={`role-${user.id}`}
                            value={user.role}
                            onChange={(event) =>
                              handleUpdateAdminUserRole(
                                user.id,
                                event.target.value as AuthUser['role']
                              )
                            }
                            className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                          >
                            <option value='purchaser'>Purchaser</option>
                            <option value='artisan'>Artisan</option>
                            <option value='admin'>Admin</option>
                          </select>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          )}

          {activeTab === 'categories' && authUser.role === 'admin' && (
            <section className='rounded-lg border border-border bg-card'>
              <header className='space-y-1 border-b border-border p-6'>
                <h2 className='text-xl font-bold'>Category Management</h2>
                <p className='text-sm text-muted-foreground'>
                  Rename categories or reassign products from one category to another.
                </p>
              </header>
              <div className='space-y-6 p-6'>
                <div className='space-y-4 rounded-lg border border-border bg-background p-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='space-y-2'>
                      <label htmlFor='categoryAction' className='text-sm font-medium'>
                        Action
                      </label>
                      <select
                        id='categoryAction'
                        value={categoryAction}
                        onChange={(event) =>
                          setCategoryAction(event.target.value as 'rename' | 'delete')
                        }
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      >
                        <option value='rename'>Rename Category</option>
                        <option value='delete'>Reassign and Remove Category</option>
                      </select>
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='sourceCategory' className='text-sm font-medium'>
                        Source Category
                      </label>
                      <select
                        id='sourceCategory'
                        value={categorySourceName}
                        onChange={(event) => setCategorySourceName(event.target.value)}
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      >
                        {adminCategories.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='targetCategory' className='text-sm font-medium'>
                        {categoryAction === 'rename' ? 'New Name' : 'Replacement Category'}
                      </label>
                      <input
                        id='targetCategory'
                        value={categoryTargetName}
                        onChange={(event) => setCategoryTargetName(event.target.value)}
                        placeholder={categoryAction === 'rename' ? 'Enter new category name' : 'Enter replacement category'}
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      />
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <button
                      type='button'
                      onClick={handleSaveCategoryAction}
                      disabled={isSavingCategoryAction || adminCategories.length === 0}
                      className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-60'
                    >
                      {isSavingCategoryAction ? 'Saving...' : 'Apply Category Change'}
                    </button>
                  </div>

                  {adminCategoriesError && (
                    <p className='text-sm text-destructive'>{adminCategoriesError}</p>
                  )}
                  {adminCategorySuccess && (
                    <p className='text-sm text-green-600'>{adminCategorySuccess}</p>
                  )}
                </div>

                <div className='space-y-3'>
                  <h3 className='font-semibold'>Current Categories</h3>
                  {isLoadingAdminCategories && (
                    <p className='text-sm text-muted-foreground'>Loading categories...</p>
                  )}
                  {!isLoadingAdminCategories &&
                    adminCategories.map((category) => (
                      <div
                        key={category.name}
                        className='flex items-center justify-between rounded-lg border border-border bg-background p-3'
                      >
                        <span className='font-medium'>{category.name}</span>
                        <span className='text-sm text-muted-foreground'>
                          {category.productCount} products
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'wishlist' && authUser.role !== 'admin' && (
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
