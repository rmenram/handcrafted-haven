'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Heart, LogOut, Package, Settings, Tags, User, Users } from 'lucide-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

type TabKey = 'profile' | 'orders' | 'products' | 'users' | 'categories' | 'wishlist' | 'settings';
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
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
};

type ArtisanProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
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
  image?: string;
};

type FeaturedToggleFeedback = {
  tone: 'success' | 'error';
  message: string;
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
const TEMP_CATEGORY_NAME = 'Temp';
const categoryThumbnailFallbacks: Record<string, string> = {
  'home decor': '/images/home-decor.webp',
  jewelry: '/images/jewelry.webp',
  kitchen: '/images/kitchen.webp',
  'pottery & ceramics': '/images/ceramics.webp',
  stationery: '/images/stationery.webp',
  'textiles & fabrics': '/images/textiles.webp',
};

function resolveCategoryThumbnail(category: AdminCategory | null): string | null {
  if (!category) {
    return null;
  }

  const name = category.name.trim().toLowerCase();
  if (name === TEMP_CATEGORY_NAME.toLowerCase()) {
    return null;
  }

  const uploadedImage = category.image?.trim();
  if (uploadedImage) {
    return uploadedImage;
  }

  return categoryThumbnailFallbacks[name] ?? null;
}

function ProfilePageContent() {
  const searchParams = useSearchParams();
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
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
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
  const [productStockQuantity, setProductStockQuantity] = useState('1');
  const [productInStock, setProductInStock] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingFeaturedProductId, setIsSavingFeaturedProductId] = useState<string | null>(null);
  const [featuredToggleFeedback, setFeaturedToggleFeedback] = useState<
    Record<string, FeaturedToggleFeedback>
  >({});
  const [selectedFeaturedProductIds, setSelectedFeaturedProductIds] = useState<string[]>([]);
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');
  const [adminShowFeaturedOnly, setAdminShowFeaturedOnly] = useState(false);
  const [adminVisibleProductCount, setAdminVisibleProductCount] = useState(12);
  const [productSuccess, setProductSuccess] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);
  const [adminUserSuccess, setAdminUserSuccess] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [adminUserForm, setAdminUserForm] = useState<AdminUser | null>(null);
  const [isSavingAdminUser, setIsSavingAdminUser] = useState(false);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>([]);
  const [isLoadingAdminCategories, setIsLoadingAdminCategories] = useState(false);
  const [adminCategoriesError, setAdminCategoriesError] = useState<string | null>(null);
  const [adminCategorySuccess, setAdminCategorySuccess] = useState<string | null>(null);
  const [categorySourceName, setCategorySourceName] = useState('');
  const [categoryTargetName, setCategoryTargetName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const [categoryAction, setCategoryAction] = useState<'rename' | 'add' | 'delete'>('rename');
  const [isSavingCategoryAction, setIsSavingCategoryAction] = useState(false);
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const featuredFeedbackTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function clearFeaturedFeedbackTimeout(productId: string) {
    const existingTimeout = featuredFeedbackTimeoutsRef.current[productId];
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      delete featuredFeedbackTimeoutsRef.current[productId];
    }
  }

  function setFeaturedFeedbackMessage(productId: string, feedback: FeaturedToggleFeedback) {
    clearFeaturedFeedbackTimeout(productId);

    setFeaturedToggleFeedback((prev) => ({
      ...prev,
      [productId]: feedback,
    }));

    featuredFeedbackTimeoutsRef.current[productId] = setTimeout(() => {
      setFeaturedToggleFeedback((prev) => {
        const { [productId]: removedFeedback, ...rest } = prev;
        void removedFeedback;
        return rest;
      });
      delete featuredFeedbackTimeoutsRef.current[productId];
    }, 2600);
  }

  const filteredAdminProducts = useMemo(() => {
    const searchTerm = adminProductSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        adminCategoryFilter === 'all' || product.category === adminCategoryFilter;
      const matchesFeatured = !adminShowFeaturedOnly || product.featured;

      if (!searchTerm) {
        return matchesCategory && matchesFeatured;
      }

      return (
        matchesCategory &&
        matchesFeatured &&
        [product.name, product.description, product.category, product.artisanName]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(searchTerm))
      );
    });
  }, [products, adminCategoryFilter, adminProductSearch, adminShowFeaturedOnly]);

  const visibleAdminProducts = useMemo(
    () => filteredAdminProducts.slice(0, adminVisibleProductCount),
    [filteredAdminProducts, adminVisibleProductCount]
  );

  useEffect(() => {
    setAdminVisibleProductCount(12);
  }, [adminProductSearch, adminCategoryFilter, adminShowFeaturedOnly]);

  useEffect(() => {
    if (!saveError && !saveSuccess) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSaveError(null);
      setSaveSuccess(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [saveError, saveSuccess]);

  useEffect(() => {
    if (!productsError && !productSuccess) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setProductsError(null);
      setProductSuccess(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [productsError, productSuccess]);

  useEffect(() => {
    if (!adminUsersError && !adminUserSuccess) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setAdminUsersError(null);
      setAdminUserSuccess(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [adminUsersError, adminUserSuccess]);

  useEffect(() => {
    if (!adminCategoriesError && !adminCategorySuccess) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setAdminCategoriesError(null);
      setAdminCategorySuccess(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [adminCategoriesError, adminCategorySuccess]);

  useEffect(() => {
    if (activeTab === 'products') {
      return;
    }

    setProductsError(null);
    setProductSuccess(null);
    setFeaturedToggleFeedback({});
    Object.values(featuredFeedbackTimeoutsRef.current).forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    featuredFeedbackTimeoutsRef.current = {};
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'profile') {
      setSaveError(null);
      setSaveSuccess(null);
    }

    if (activeTab !== 'orders') {
      setExpandedOrderId(null);
    }

    if (activeTab !== 'users') {
      setAdminUsersError(null);
      setAdminUserSuccess(null);
    }

    if (activeTab !== 'categories') {
      setAdminCategoriesError(null);
      setAdminCategorySuccess(null);
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      Object.values(featuredFeedbackTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      featuredFeedbackTimeoutsRef.current = {};
    };
  }, []);

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

  const adminCategoryOptions = useMemo(
    () => adminCategories.map((category) => category.name),
    [adminCategories]
  );

  const manageableAdminCategories = useMemo(
    () => adminCategories.filter((category) => category.name.toLowerCase() !== 'temp'),
    [adminCategories]
  );

  const selectedSourceCategory = useMemo(
    () => adminCategories.find((category) => category.name === categorySourceName) ?? null,
    [adminCategories, categorySourceName]
  );

  const selectedSourceCategoryThumbnail = useMemo(
    () => resolveCategoryThumbnail(selectedSourceCategory),
    [selectedSourceCategory]
  );

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
    if (categoryAction === 'add') {
      return;
    }

    if (manageableAdminCategories.length === 0) {
      setCategorySourceName('');
      return;
    }

    const hasSelectedSource = manageableAdminCategories.some(
      (category) => category.name === categorySourceName
    );

    if (!hasSelectedSource) {
      setCategorySourceName(manageableAdminCategories[0].name);
    }
  }, [categoryAction, manageableAdminCategories, categorySourceName]);

  useEffect(() => {
    setCategoryImage('');
  }, [categoryAction]);

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
            setExpandedOrderId(null);
            return;
          }

          const loadedOrders = data.orders ?? [];
          setOrders(loadedOrders);
          setExpandedOrderId((current) =>
            loadedOrders.some((order) => order.id === current)
              ? current
              : (loadedOrders[0]?.id ?? null)
          );
        } catch {
          setOrdersError('Unable to connect. Please try again.');
          setOrders([]);
          setExpandedOrderId(null);
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
            setCategoryImage('');
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
      const artisanProfileFields =
        authUser?.role === 'artisan'
          ? {
              location: location.trim(),
              bio: bio.trim(),
              specialties: specialties
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            }
          : {};

      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email.trim(),
          phone: phone.trim(),
          profileImage: profileImage.trim(),
          ...artisanProfileFields,
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
    setProductStockQuantity('1');
    setProductInStock(true);
  }

  function startProductEdit(product: ArtisanProduct) {
    setProductId(product.id);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductCategory(product.category);
    setProductImage(product.image);
    setProductPrice(String(product.price));
    setProductStockQuantity(String(product.stockQuantity ?? (product.inStock ? 1 : 0)));
    setProductInStock(product.inStock);
    setProductSuccess(null);
    setProductsError(null);
    setActiveTab('products');
  }

  async function handleSaveProduct() {
    setProductsError(null);
    setProductSuccess(null);

    const parsedPrice = Number(productPrice);
    const parsedStockQuantity = Number(productStockQuantity);
    if (
      productName.trim().length < 2 ||
      productDescription.trim().length < 10 ||
      productCategory.trim().length < 2 ||
      !productImage.trim() ||
      Number.isNaN(parsedPrice) ||
      parsedPrice < 0 ||
      Number.isNaN(parsedStockQuantity) ||
      !Number.isInteger(parsedStockQuantity) ||
      parsedStockQuantity < 0
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
          stockQuantity: parsedStockQuantity,
          inStock: parsedStockQuantity > 0,
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

  async function handleToggleFeaturedProduct(productId: string, shouldBeFeatured: boolean) {
    if (isSavingFeaturedProductId) {
      return;
    }

    clearFeaturedFeedbackTimeout(productId);
    setFeaturedToggleFeedback((prev) => {
      const { [productId]: _removed, ...rest } = prev;
      void _removed;
      return rest;
    });

    const previousFeaturedIds = selectedFeaturedProductIds;
    const nextFeaturedIds = shouldBeFeatured
      ? previousFeaturedIds.includes(productId)
        ? previousFeaturedIds
        : [...previousFeaturedIds, productId]
      : previousFeaturedIds.filter((id) => id !== productId);

    setSelectedFeaturedProductIds(nextFeaturedIds);
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, featured: shouldBeFeatured } : product
      )
    );

    setIsSavingFeaturedProductId(productId);

    try {
      const response = await fetch('/api/products/featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: nextFeaturedIds }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSelectedFeaturedProductIds(previousFeaturedIds);
        setProducts((prev) =>
          prev.map((product) => ({
            ...product,
            featured: previousFeaturedIds.includes(product.id),
          }))
        );
        setFeaturedFeedbackMessage(productId, {
          tone: 'error',
          message: data.message ?? 'Unable to update featured status.',
        });
        return;
      }

      setFeaturedFeedbackMessage(productId, {
        tone: 'success',
        message: shouldBeFeatured
          ? 'Product marked as featured.'
          : 'Product removed from featured products.',
      });
    } catch {
      setSelectedFeaturedProductIds(previousFeaturedIds);
      setProducts((prev) =>
        prev.map((product) => ({
          ...product,
          featured: previousFeaturedIds.includes(product.id),
        }))
      );
      setFeaturedFeedbackMessage(productId, {
        tone: 'error',
        message: 'Unable to connect. Please try again.',
      });
    } finally {
      setIsSavingFeaturedProductId(null);
    }
  }

  function resetAdminUserForm() {
    setAdminUserId(null);
    setAdminUserForm(null);
  }

  function startAdminUserEdit(user: AdminUser) {
    setAdminUserId(user.id);
    setAdminUserForm({
      ...user,
      specialties: [...(user.specialties ?? [])],
    });
    setAdminUsersError(null);
    setAdminUserSuccess(null);
    setActiveTab('users');
  }

  function handleAdminUserFormChange(updates: Partial<AdminUser>) {
    setAdminUserForm((current) => {
      if (!current) {
        return current;
      }

      const next = { ...current, ...updates };
      if (next.role !== 'artisan') {
        next.location = '';
        next.bio = '';
        next.specialties = [];
      }

      return next;
    });
  }

  async function handleSaveAdminUser() {
    setAdminUsersError(null);
    setAdminUserSuccess(null);

    if (!adminUserForm || !adminUserId) {
      setAdminUsersError('Select a user to edit.');
      return;
    }

    const nextRole = adminUserForm.role;
    const payload = {
      userId: adminUserId,
      name: adminUserForm.name.trim(),
      email: adminUserForm.email.trim(),
      phone: (adminUserForm.phone ?? '').trim(),
      role: nextRole,
      profileImage: (adminUserForm.profileImage ?? '').trim(),
      location: nextRole === 'artisan' ? (adminUserForm.location ?? '').trim() : '',
      bio: nextRole === 'artisan' ? (adminUserForm.bio ?? '').trim() : '',
      specialties: nextRole === 'artisan' ? (adminUserForm.specialties ?? []) : [],
    };

    if (!payload.name || !payload.email) {
      setAdminUsersError('Name and email are required to update a user.');
      return;
    }

    setIsSavingAdminUser(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string; user?: AdminUser };

      if (!response.ok || !data.user) {
        setAdminUsersError(data.message ?? 'Unable to update user');
        return;
      }

      setAdminUsers((prev) => prev.map((item) => (item.id === adminUserId ? data.user! : item)));
      resetAdminUserForm();
      setAdminUserSuccess('User updated successfully.');
    } catch {
      setAdminUsersError('Unable to connect. Please try again.');
    } finally {
      setIsSavingAdminUser(false);
    }
  }

  async function handleSaveCategoryAction() {
    setAdminCategoriesError(null);
    setAdminCategorySuccess(null);

    if (isUploadingCategoryImage) {
      setAdminCategoriesError('Please wait for the category image upload to complete.');
      return;
    }

    if (categoryAction === 'add' && !categoryTargetName.trim()) {
      setAdminCategoriesError('Category name is required.');
      return;
    }

    if (categoryAction === 'add' && !categoryImage.trim()) {
      setAdminCategoriesError('Category image is required when adding a category.');
      return;
    }

    if (categoryAction !== 'add' && !categorySourceName.trim()) {
      setAdminCategoriesError('Source category is required.');
      return;
    }

    if (categoryAction === 'rename' && !categoryTargetName.trim()) {
      setAdminCategoriesError('New category name is required.');
      return;
    }

    if (
      (categoryAction === 'add' || categoryAction === 'rename') &&
      categoryImage.trim() &&
      !/^\/images\/[^/]+\.webp$/i.test(categoryImage.trim())
    ) {
      setAdminCategoriesError('Category image must be an uploaded .webp file.');
      return;
    }

    if (
      categoryAction === 'rename' &&
      categorySourceName.trim().toLowerCase() === categoryTargetName.trim().toLowerCase()
    ) {
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
              ...(categoryImage.trim() ? { image: categoryImage.trim() } : {}),
            }
          : categoryAction === 'add'
            ? {
                action: 'add',
                name: categoryTargetName.trim(),
                image: categoryImage.trim(),
              }
            : {
                action: 'delete',
                name: categorySourceName.trim(),
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
      const nextSourceOptions = data.categories.filter(
        (category) => category.name.toLowerCase() !== 'temp'
      );
      if (nextSourceOptions.length > 0) {
        setCategorySourceName(nextSourceOptions[0].name);
      }
      if (categoryAction === 'add' || categoryAction === 'rename') {
        setCategoryTargetName('');
        setCategoryImage('');
      }
      setProductSuccess(
        categoryAction === 'rename'
          ? 'Category renamed. Product categories were updated.'
          : categoryAction === 'add'
            ? 'Category added successfully.'
            : 'Category deleted. Products were moved to Temp.'
      );
      setAdminCategorySuccess('Categories updated successfully.');
    } catch {
      setAdminCategoriesError('Unable to connect. Please try again.');
    } finally {
      setIsSavingCategoryAction(false);
    }
  }

  async function handleCategoryImageUpload(file: File) {
    setAdminCategoriesError(null);
    setAdminCategorySuccess(null);

    if (file.type !== 'image/webp' && !file.name.toLowerCase().endsWith('.webp')) {
      setAdminCategoriesError('Only .webp images are accepted.');
      return;
    }

    setIsUploadingCategoryImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/categories/upload', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as { message?: string; imagePath?: string };

      if (!response.ok || !data.imagePath) {
        setAdminCategoriesError(data.message ?? 'Unable to upload category image.');
        return;
      }

      setCategoryImage(data.imagePath);
      setAdminCategorySuccess('Category image uploaded successfully.');
    } catch {
      setAdminCategoriesError('Unable to upload image. Please try again.');
    } finally {
      setIsUploadingCategoryImage(false);
    }
  }

  const userRole = authUser?.role;

  const tabs: Array<{ key: TabKey; label: string; icon: typeof User }> = useMemo(
    () =>
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
            ],
    [userRole]
  );

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (!requestedTab) {
      return;
    }

    const isValidTab = tabs.some((tab) => tab.key === requestedTab);
    if (!isValidTab) {
      return;
    }

    setActiveTab(requestedTab as TabKey);
  }, [searchParams, tabs]);

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
              Sign In
            </Link>
            <Link
              href='/signup'
              className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
            >
              Sign Up
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

                {authUser.role === 'artisan' && (
                  <>
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
                  </>
                )}

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
                  orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;

                    return (
                      <div
                        key={order.id}
                        className='overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-md'
                      >
                        <button
                          type='button'
                          onClick={() =>
                            setExpandedOrderId((current) =>
                              current === order.id ? null : order.id
                            )
                          }
                          className='flex w-full items-center justify-between gap-4 p-4 text-left'
                          aria-expanded={isExpanded}
                          aria-controls={`order-details-${order.id}`}
                        >
                          <div className='space-y-1'>
                            <p className='font-semibold'>
                              Order #{order.id.slice(-6).toUpperCase()}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              {new Date(order.date).toLocaleDateString()} - {order.items.length}{' '}
                              {order.items.length === 1 ? 'item' : 'items'}
                            </p>
                            <p className='text-sm'>
                              <span className='font-medium'>Status:</span>{' '}
                              <span className='text-green-600'>{order.status}</span>
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-lg font-bold'>${order.total.toFixed(2)}</p>
                            <p className='text-xs text-muted-foreground'>
                              {isExpanded ? 'Click to hide details' : 'Click to view items'}
                            </p>
                          </div>
                        </button>

                        {isExpanded && (
                          <div
                            id={`order-details-${order.id}`}
                            className='border-t border-border bg-card px-4 py-4'
                          >
                            <div className='mb-4 grid gap-3 sm:grid-cols-3'>
                              <div className='rounded-md border border-border bg-background p-3'>
                                <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                  Order date
                                </p>
                                <p className='mt-1 text-sm font-medium'>
                                  {new Date(order.date).toLocaleString()}
                                </p>
                              </div>
                              <div className='rounded-md border border-border bg-background p-3'>
                                <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                  Status
                                </p>
                                <p className='mt-1 text-sm font-medium'>{order.status}</p>
                              </div>
                              <div className='rounded-md border border-border bg-background p-3'>
                                <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                  Total
                                </p>
                                <p className='mt-1 text-sm font-medium'>
                                  ${order.total.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className='space-y-3'>
                              <h3 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
                                Items purchased
                              </h3>
                              <div className='space-y-3'>
                                {order.items.map((item) => (
                                  <div
                                    key={`${order.id}-${item.productId}`}
                                    className='flex items-start justify-between gap-4 rounded-md border border-border bg-background p-3'
                                  >
                                    <div className='space-y-1'>
                                      <p className='font-medium'>{item.name}</p>
                                      <p className='text-sm text-muted-foreground'>
                                        Qty {item.quantity} x ${item.price.toFixed(2)}
                                      </p>
                                    </div>
                                    <p className='text-sm font-semibold'>
                                      ${item.subtotal.toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {activeTab === 'products' &&
            (authUser.role === 'artisan' || authUser.role === 'admin') && (
              <section className='rounded-lg border border-border bg-card'>
                <header className='space-y-1 border-b border-border p-6'>
                  <h2 className='text-xl font-bold'>
                    {authUser.role === 'admin' ? 'Site Products' : 'My Products'}
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    {authUser.role === 'admin'
                      ? 'View and manage all products across the site, and choose featured products'
                      : 'Create and manage items for sale'}
                  </p>
                </header>
                {authUser.role === 'admin' ? (
                  <div className='space-y-6 p-6'>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between gap-3'>
                        <h3 className='font-semibold'>All Products</h3>
                        <p className='text-xs text-muted-foreground'>
                          Showing {visibleAdminProducts.length} of {filteredAdminProducts.length}
                        </p>
                      </div>
                      <div className='grid grid-cols-1 gap-3 rounded-lg border border-border bg-background p-4 md:grid-cols-3'>
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
                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>Quick filter</label>
                          <div className='flex h-10 items-center justify-between rounded-md border border-border bg-input-background px-3'>
                            <label className='inline-flex items-center gap-2 text-sm'>
                              <input
                                type='checkbox'
                                checked={adminShowFeaturedOnly}
                                onChange={(event) => setAdminShowFeaturedOnly(event.target.checked)}
                                className='h-4 w-4 rounded border-border'
                              />
                              Featured only
                            </label>
                            <button
                              type='button'
                              onClick={() => {
                                setAdminProductSearch('');
                                setAdminCategoryFilter('all');
                                setAdminShowFeaturedOnly(false);
                              }}
                              className='text-xs font-medium text-amber-700 hover:underline'
                            >
                              Reset
                            </button>
                          </div>
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
                        visibleAdminProducts.map((product) => {
                          const isChecked = selectedFeaturedProductIds.includes(product.id);
                          const isSavingFeaturedThisProduct =
                            isSavingFeaturedProductId === product.id;
                          const featuredFeedback = featuredToggleFeedback[product.id];
                          const isEditingThisProduct = productId === product.id;

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
                                    disabled={Boolean(isSavingFeaturedProductId)}
                                    onChange={(event) =>
                                      void handleToggleFeaturedProduct(
                                        product.id,
                                        event.target.checked
                                      )
                                    }
                                    className='h-4 w-4 rounded border-border'
                                  />
                                  Featured
                                </label>

                                <button
                                  type='button'
                                  onClick={() => startProductEdit(product)}
                                  className='inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent'
                                >
                                  {isEditingThisProduct ? 'Editing' : 'Edit'}
                                </button>
                              </div>

                              <div className='mt-2 min-h-5'>
                                {isSavingFeaturedThisProduct && (
                                  <p className='text-xs text-muted-foreground'>
                                    Saving featured status...
                                  </p>
                                )}
                                {!isSavingFeaturedThisProduct && featuredFeedback && (
                                  <p
                                    className={`text-xs ${
                                      featuredFeedback.tone === 'success'
                                        ? 'text-green-600'
                                        : 'text-destructive'
                                    }`}
                                  >
                                    {featuredFeedback.message}
                                  </p>
                                )}
                              </div>

                              {isEditingThisProduct && (
                                <div className='mt-4 space-y-4 rounded-md border border-border bg-card p-4'>
                                  <p className='text-sm font-semibold'>Edit Product Details</p>

                                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                      <label className='text-sm font-medium'>Name</label>
                                      <input
                                        value={productName}
                                        onChange={(event) => setProductName(event.target.value)}
                                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                      />
                                    </div>
                                    <div className='space-y-2'>
                                      <label className='text-sm font-medium'>Category</label>
                                      <select
                                        value={productCategory}
                                        onChange={(event) => setProductCategory(event.target.value)}
                                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                      >
                                        {adminCategoryOptions
                                          .filter(
                                            (categoryName) =>
                                              categoryName.toLowerCase() !==
                                              TEMP_CATEGORY_NAME.toLowerCase()
                                          )
                                          .map((category) => (
                                            <option key={category} value={category}>
                                              {category}
                                            </option>
                                          ))}
                                      </select>
                                    </div>
                                  </div>

                                  <div className='space-y-2'>
                                    <label className='text-sm font-medium'>Description</label>
                                    <textarea
                                      rows={4}
                                      value={productDescription}
                                      onChange={(event) =>
                                        setProductDescription(event.target.value)
                                      }
                                      className='w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                    />
                                  </div>

                                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                      <label className='text-sm font-medium'>Image URL</label>
                                      <input
                                        value={productImage}
                                        onChange={(event) => setProductImage(event.target.value)}
                                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                      />
                                    </div>
                                    <div className='space-y-2'>
                                      <label className='text-sm font-medium'>Price</label>
                                      <input
                                        type='number'
                                        min='0'
                                        step='0.01'
                                        value={productPrice}
                                        onChange={(event) => setProductPrice(event.target.value)}
                                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                      />
                                    </div>
                                  </div>

                                  <div className='space-y-2'>
                                    <label className='text-sm font-medium'>Stock quantity</label>
                                    <input
                                      type='number'
                                      min='0'
                                      step='1'
                                      value={productStockQuantity}
                                      onChange={(event) => {
                                        const value = event.target.value;
                                        setProductStockQuantity(value);
                                        setProductInStock(Number(value) > 0);
                                      }}
                                      className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                    />
                                  </div>

                                  <label className='inline-flex items-center gap-2 text-sm text-foreground'>
                                    <input
                                      type='checkbox'
                                      checked={productInStock}
                                      onChange={(event) => {
                                        const checked = event.target.checked;
                                        setProductInStock(checked);
                                        if (!checked) {
                                          setProductStockQuantity('0');
                                        } else if (Number(productStockQuantity) < 1) {
                                          setProductStockQuantity('1');
                                        }
                                      }}
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
                                      Cancel
                                    </button>
                                  </div>

                                  {productsError && (
                                    <p className='text-sm text-destructive'>{productsError}</p>
                                  )}
                                  {productSuccess && (
                                    <p className='text-sm text-green-600'>{productSuccess}</p>
                                  )}
                                </div>
                              )}
                            </article>
                          );
                        })}

                      {!isLoadingProducts &&
                        filteredAdminProducts.length > visibleAdminProducts.length && (
                          <div className='pt-2'>
                            <button
                              type='button'
                              onClick={() => setAdminVisibleProductCount((current) => current + 12)}
                              className='inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
                            >
                              {(() => {
                                const remaining =
                                  filteredAdminProducts.length - visibleAdminProducts.length;
                                const loadCount = Math.min(12, remaining);
                                return `Load ${loadCount} more`;
                              })()}
                            </button>
                          </div>
                        )}
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
                      <div className='space-y-2'>
                        <label htmlFor='productStockQuantity' className='text-sm font-medium'>
                          Stock quantity
                        </label>
                        <input
                          id='productStockQuantity'
                          type='number'
                          min='0'
                          step='1'
                          value={productStockQuantity}
                          onChange={(event) => {
                            const value = event.target.value;
                            setProductStockQuantity(value);
                            setProductInStock(Number(value) > 0);
                          }}
                          className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                        />
                      </div>
                      <label className='inline-flex items-center gap-2 text-sm text-foreground'>
                        <input
                          type='checkbox'
                          checked={productInStock}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setProductInStock(checked);
                            if (!checked) {
                              setProductStockQuantity('0');
                            } else if (Number(productStockQuantity) < 1) {
                              setProductStockQuantity('1');
                            }
                          }}
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
                                {product.inStock
                                  ? `In stock (${product.stockQuantity} available)`
                                  : 'Out of stock'}
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
                  Update account details and role assignments across all users.
                </p>
              </header>
              <div className='space-y-6 p-6'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <h3 className='font-semibold'>All Users</h3>
                    <p className='text-xs text-muted-foreground'>
                      Showing {filteredAdminUsers.length} of {adminUsers.length}
                    </p>
                  </div>

                  <div className='space-y-2 rounded-lg border border-border bg-background p-4'>
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

                  {isLoadingAdminUsers && (
                    <p className='text-sm text-muted-foreground'>Loading users...</p>
                  )}
                  {!isLoadingAdminUsers && adminUsers.length === 0 && !adminUsersError && (
                    <p className='text-sm text-muted-foreground'>No users found.</p>
                  )}
                  {!isLoadingAdminUsers &&
                    adminUsers.length > 0 &&
                    filteredAdminUsers.length === 0 && (
                      <p className='text-sm text-muted-foreground'>
                        No users match your current search.
                      </p>
                    )}

                  {!isLoadingAdminUsers &&
                    !adminUsersError &&
                    filteredAdminUsers.map((user) => {
                      const isEditingThisUser = adminUserId === user.id;

                      return (
                        <article
                          key={user.id}
                          className='rounded-lg border border-border bg-background p-4'
                        >
                          <div className='flex items-start justify-between gap-4'>
                            <div className='space-y-1'>
                              <p className='font-semibold'>{user.name}</p>
                              <p className='text-sm text-muted-foreground'>{user.email}</p>
                              <p className='text-xs text-muted-foreground'>
                                Role: {user.role}
                                {user.location ? ` - ${user.location}` : ''}
                              </p>
                              {user.phone && (
                                <p className='text-xs text-muted-foreground'>Phone: {user.phone}</p>
                              )}
                            </div>
                            <button
                              type='button'
                              onClick={() => startAdminUserEdit(user)}
                              className='inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent'
                            >
                              {isEditingThisUser ? 'Editing' : 'Edit'}
                            </button>
                          </div>

                          {isEditingThisUser && adminUserForm && (
                            <div className='mt-4 space-y-4 rounded-md border border-border bg-card p-4'>
                              <p className='text-sm font-semibold'>Edit User Details</p>

                              <div className='grid gap-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                  <label className='text-sm font-medium'>Name</label>
                                  <input
                                    value={adminUserForm.name}
                                    onChange={(event) =>
                                      handleAdminUserFormChange({ name: event.target.value })
                                    }
                                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                  />
                                </div>

                                <div className='space-y-2'>
                                  <label className='text-sm font-medium'>Email</label>
                                  <input
                                    type='email'
                                    value={adminUserForm.email}
                                    onChange={(event) =>
                                      handleAdminUserFormChange({ email: event.target.value })
                                    }
                                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                  />
                                </div>

                                <div className='space-y-2'>
                                  <label className='text-sm font-medium'>Phone</label>
                                  <input
                                    value={adminUserForm.phone ?? ''}
                                    onChange={(event) =>
                                      handleAdminUserFormChange({ phone: event.target.value })
                                    }
                                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                  />
                                </div>

                                <div className='space-y-2'>
                                  <label className='text-sm font-medium'>Role</label>
                                  <select
                                    value={adminUserForm.role}
                                    onChange={(event) =>
                                      handleAdminUserFormChange({
                                        role: event.target.value as AuthUser['role'],
                                      })
                                    }
                                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                  >
                                    <option value='purchaser'>Purchaser</option>
                                    <option value='artisan'>Artisan</option>
                                    <option value='admin'>Admin</option>
                                  </select>
                                </div>

                                <div className='space-y-2 md:col-span-2'>
                                  <label className='text-sm font-medium'>Profile Image URL</label>
                                  <input
                                    value={adminUserForm.profileImage ?? ''}
                                    onChange={(event) =>
                                      handleAdminUserFormChange({
                                        profileImage: event.target.value,
                                      })
                                    }
                                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                  />
                                </div>

                                {adminUserForm.role === 'artisan' && (
                                  <>
                                    <div className='space-y-2'>
                                      <label className='text-sm font-medium'>Location</label>
                                      <input
                                        value={adminUserForm.location ?? ''}
                                        onChange={(event) =>
                                          handleAdminUserFormChange({
                                            location: event.target.value,
                                          })
                                        }
                                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                      />
                                    </div>

                                    <div className='space-y-2 md:col-span-2'>
                                      <label className='text-sm font-medium'>
                                        Specialties (comma separated)
                                      </label>
                                      <input
                                        value={(adminUserForm.specialties ?? []).join(', ')}
                                        onChange={(event) =>
                                          handleAdminUserFormChange({
                                            specialties: event.target.value
                                              .split(',')
                                              .map((item) => item.trim())
                                              .filter(Boolean),
                                          })
                                        }
                                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                      />
                                    </div>

                                    <div className='space-y-2 md:col-span-2'>
                                      <label className='text-sm font-medium'>Bio</label>
                                      <textarea
                                        rows={3}
                                        value={adminUserForm.bio ?? ''}
                                        onChange={(event) =>
                                          handleAdminUserFormChange({ bio: event.target.value })
                                        }
                                        className='w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                                      />
                                    </div>
                                  </>
                                )}
                              </div>

                              {adminUsersError && (
                                <p className='text-sm text-destructive'>{adminUsersError}</p>
                              )}
                              {adminUserSuccess && (
                                <p className='text-sm text-green-600'>{adminUserSuccess}</p>
                              )}

                              <div className='flex items-center gap-3'>
                                <button
                                  type='button'
                                  onClick={handleSaveAdminUser}
                                  disabled={isSavingAdminUser || !adminUserId}
                                  className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-60'
                                >
                                  {isSavingAdminUser ? 'Saving...' : 'Save User Changes'}
                                </button>
                                <button
                                  type='button'
                                  onClick={resetAdminUserForm}
                                  className='inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'categories' && authUser.role === 'admin' && (
            <section className='rounded-lg border border-border bg-card'>
              <header className='space-y-1 border-b border-border p-6'>
                <h2 className='text-xl font-bold'>Category Management</h2>
                <p className='text-sm text-muted-foreground'>
                  Rename categories, add new categories, or delete categories by moving products to
                  Temp.
                </p>
              </header>
              <div className='space-y-6 p-6'>
                <div className='space-y-4 rounded-lg border border-border bg-background p-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                    <div className='space-y-2 md:col-span-2'>
                      <label htmlFor='categoryAction' className='text-sm font-medium'>
                        Action
                      </label>
                      <select
                        id='categoryAction'
                        value={categoryAction}
                        onChange={(event) =>
                          setCategoryAction(event.target.value as 'rename' | 'add' | 'delete')
                        }
                        className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                      >
                        <option value='add'>Add Category</option>
                        <option value='rename'>Rename Category</option>
                        <option value='delete'>Remove Category (Move to Temp)</option>
                      </select>
                    </div>
                    {categoryAction !== 'add' && (
                      <div className='space-y-2 md:col-span-1'>
                        <label htmlFor='sourceCategory' className='text-sm font-medium'>
                          Source Category
                        </label>
                        <select
                          id='sourceCategory'
                          value={categorySourceName}
                          onChange={(event) => setCategorySourceName(event.target.value)}
                          className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                        >
                          {manageableAdminCategories.map((category) => (
                            <option key={category.name} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {categoryAction !== 'delete' && (
                      <div className='space-y-2 md:col-span-1'>
                        <label htmlFor='targetCategory' className='text-sm font-medium'>
                          {categoryAction === 'rename' ? 'New Name' : 'Category Name'}
                        </label>
                        <input
                          id='targetCategory'
                          value={categoryTargetName}
                          onChange={(event) => setCategoryTargetName(event.target.value)}
                          placeholder={
                            categoryAction === 'rename'
                              ? 'Enter new category name'
                              : 'Enter category name'
                          }
                          className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                        />
                      </div>
                    )}
                    {(categoryAction === 'add' || categoryAction === 'rename') && (
                      <div className='space-y-2 md:col-span-2'>
                        <label htmlFor='categoryImage' className='text-sm font-medium'>
                          Category Image (.webp)
                        </label>
                        <div className='flex flex-col gap-2 rounded-md border border-border bg-input-background p-3 sm:flex-row sm:items-center sm:justify-between'>
                          <label
                            htmlFor='categoryImage'
                            className='inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-amber-600 px-3 text-sm font-medium text-white transition-colors hover:bg-amber-700'
                          >
                            Choose .webp File
                          </label>
                          <p className='text-xs text-muted-foreground' aria-live='polite'>
                            {isUploadingCategoryImage
                              ? 'Uploading image...'
                              : categoryImage
                                ? `Uploaded: ${categoryImage.split('/').pop() ?? categoryImage}`
                                : 'No image uploaded yet'}
                          </p>
                        </div>
                        <input
                          id='categoryImage'
                          type='file'
                          accept='image/webp'
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void handleCategoryImageUpload(file);
                            }
                            event.currentTarget.value = '';
                          }}
                          className='sr-only'
                        />
                        <p className='text-xs text-muted-foreground'>
                          {categoryAction === 'add'
                            ? 'Required. Upload a .webp file to /public/images.'
                            : 'Optional for rename. Leave empty to keep current image.'}
                        </p>

                        {(categoryImage ||
                          (categoryAction === 'rename' && selectedSourceCategoryThumbnail)) && (
                          <div className='flex items-center gap-3 rounded-md border border-border bg-card/60 p-2'>
                            <Image
                              src={
                                categoryImage ||
                                selectedSourceCategoryThumbnail ||
                                '/images/stationery.webp'
                              }
                              alt='Category preview'
                              width={56}
                              height={56}
                              className='h-14 w-14 rounded-md object-cover'
                            />
                            <div className='text-xs text-muted-foreground'>
                              {isUploadingCategoryImage
                                ? 'Uploading image...'
                                : categoryImage
                                  ? 'New image uploaded'
                                  : 'Current category image'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className='flex items-center gap-3'>
                    <button
                      type='button'
                      onClick={handleSaveCategoryAction}
                      disabled={
                        isUploadingCategoryImage ||
                        isSavingCategoryAction ||
                        (categoryAction !== 'add' && manageableAdminCategories.length === 0)
                      }
                      className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-60'
                    >
                      {isSavingCategoryAction
                        ? 'Saving...'
                        : categoryAction === 'rename'
                          ? 'Rename Category'
                          : categoryAction === 'add'
                            ? 'Add Category'
                            : 'Delete Category'}
                    </button>
                  </div>

                  {categoryAction === 'delete' && (
                    <p className='text-xs text-muted-foreground'>
                      Deleting a category moves its products to Temp so they are hidden from the
                      storefront until reassigned.
                    </p>
                  )}

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
                        <div className='flex items-center gap-3'>
                          {resolveCategoryThumbnail(category) ? (
                            <Image
                              src={resolveCategoryThumbnail(category) ?? '/images/stationery.webp'}
                              alt={`${category.name} thumbnail`}
                              width={32}
                              height={32}
                              className='h-8 w-8 rounded object-cover'
                            />
                          ) : (
                            <div className='flex h-8 w-8 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground'>
                              {category.name.toLowerCase() === TEMP_CATEGORY_NAME.toLowerCase() ? (
                                'TMP'
                              ) : (
                                <Tags className='h-4 w-4' aria-hidden='true' />
                              )}
                            </div>
                          )}
                          <span className='font-medium'>{category.name}</span>
                        </div>
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
              <div className='space-y-4 p-6 text-sm text-muted-foreground'>
                <p>
                  Manage wishlist items from the dedicated wishlist page, where you can remove items
                  or move them to cart.
                </p>
                <Link
                  href='/wishlist'
                  className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
                >
                  Open Wishlist
                </Link>
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

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className='mx-auto w-full max-w-3xl px-4 py-16 text-center text-muted-foreground'>
          Loading profile...
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
