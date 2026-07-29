"use client";

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Moon, Sun, Lock, Bell, ChevronRight, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 font-heading dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1 dark:text-slate-400">Manage your profile, application preferences, and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
              activeTab === 'profile' 
                ? 'bg-slate-900 text-white shadow-md dark:bg-slate-800' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <span className="font-medium text-sm">Account & Profile</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
              activeTab === 'preferences' 
                ? 'bg-slate-900 text-white shadow-md dark:bg-slate-800' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium text-sm">Preferences</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
              activeTab === 'security' 
                ? 'bg-slate-900 text-white shadow-md dark:bg-slate-800' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span className="font-medium text-sm">Security & Audits</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
              activeTab === 'notifications' 
                ? 'bg-slate-900 text-white shadow-md dark:bg-slate-800' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span className="font-medium text-sm">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          
          {activeTab === 'profile' && (
            <div className="fp-card p-6 border-t-4 border-t-slate-800 dark:border-t-slate-600">
              <h3 className="text-lg font-bold text-slate-900 mb-4 dark:text-white">Profile Information</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
                  FP
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Admin User</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">accountant@cybernuts.com</p>
                </div>
              </div>
              <div className="pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">Company Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-emerald-500" defaultValue="Cyber Nuts Ltd." />
                </div>
                <button className="btn-primary px-4 py-2 text-sm mt-2">Save Profile</button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="fp-card p-6 border-t-4 border-t-emerald-500">
              <h3 className="text-lg font-bold text-slate-900 mb-6 dark:text-white">Application Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Dark Mode</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Adjust the visual appearance of the application.</p>
                  </div>
                  <div className="flex bg-slate-100 rounded-lg p-1 dark:bg-slate-800">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                        theme === 'light' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                        theme === 'dark' ? 'bg-slate-900 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Email Notifications</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive weekly PDF audit reports.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 dark:bg-slate-700 dark:border-slate-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="fp-card p-6 border-t-4 border-t-rose-500">
              <h3 className="text-lg font-bold text-slate-900 mb-6 dark:text-white">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-200 transition-colors">Enable</button>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 dark:text-white">Change Password</h4>
                  <div className="space-y-3 max-w-sm">
                    <input type="password" placeholder="Current Password" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                    <input type="password" placeholder="New Password" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
                    <button className="btn-primary px-4 py-2 text-sm mt-2">Update Password</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="fp-card p-6 border-t-4 border-t-blue-500">
              <h3 className="text-lg font-bold text-slate-900 mb-6 dark:text-white">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="notif-1" className="mt-1" defaultChecked />
                  <div>
                    <label htmlFor="notif-1" className="font-bold text-slate-900 dark:text-white cursor-pointer">AI Audit Alerts</label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when a transaction is flagged by the AI.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="notif-2" className="mt-1" defaultChecked />
                  <div>
                    <label htmlFor="notif-2" className="font-bold text-slate-900 dark:text-white cursor-pointer">Weekly Digest</label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive a weekly summary of your P&L and Balance Sheet.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
