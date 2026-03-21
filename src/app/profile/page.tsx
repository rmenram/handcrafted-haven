'use client';

import { Heart, Package, Settings, User } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

type TabKey = 'profile' | 'orders' | 'wishlist' | 'settings';

const tabs: Array<{ key: TabKey; label: string; icon: typeof User }> = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const user = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
};

const orders = [
  { id: 'ORD-001', date: '2026-03-08', total: 156.0, status: 'Delivered', items: 2 },
  { id: 'ORD-002', date: '2026-02-15', total: 89.99, status: 'Delivered', items: 1 },
  { id: 'ORD-003', date: '2026-01-22', total: 234.5, status: 'Delivered', items: 3 },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  const tabButtonClasses = (key: TabKey) =>
    [
      'inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
      activeTab === key
        ? 'bg-foreground text-background'
        : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    ].join(' ');

  return (
    <div className='mx-auto w-full px-4 py-8'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-8 flex items-center space-x-4'>
          <Image
            src={user.avatar}
            alt={user.name}
            width={80}
            height={80}
            unoptimized
            className='h-20 w-20 rounded-full object-cover'
          />
          <div>
            <h1 className='text-3xl font-bold'>{user.name}</h1>
            <p className='text-muted-foreground'>{user.email}</p>
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
                      defaultValue='Sarah'
                      className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label htmlFor='lastName' className='text-sm font-medium'>
                      Last Name
                    </label>
                    <input
                      id='lastName'
                      defaultValue='Johnson'
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
                    defaultValue={user.email}
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
                    className='h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/30'
                  />
                </div>

                <button
                  type='button'
                  className='inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700'
                >
                  Save Changes
                </button>
              </div>
            </section>
          )}

          {activeTab === 'orders' && (
            <section className='rounded-lg border border-border bg-card'>
              <header className='space-y-1 border-b border-border p-6'>
                <h2 className='text-xl font-bold'>Order History</h2>
                <p className='text-sm text-muted-foreground'>View and track your previous orders</p>
              </header>
              <div className='space-y-4 p-6'>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className='flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-md'
                  >
                    <div className='space-y-1'>
                      <p className='font-semibold'>{order.id}</p>
                      <p className='text-sm text-muted-foreground'>
                        {order.date} - {order.items} {order.items === 1 ? 'item' : 'items'}
                      </p>
                      <p className='text-sm'>
                        <span className='font-medium'>Status:</span>{' '}
                        <span className='text-green-600'>{order.status}</span>
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-lg font-bold'>${order.total.toFixed(2)}</p>
                      <button
                        type='button'
                        className='mt-2 inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent'
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
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
