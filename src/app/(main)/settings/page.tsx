'use client';
import React, { useState } from 'react';
import NavigationBar from '@/app/(main)/layouts/navbar';
import { Button } from '@/components/ui/button';
import PasswordChange from '@/components/settings/password';
import Notifications from '@/components/settings/notifications';
import Privacy from '@/components/settings/privacy';
const SettingsPage = () => {

    const [item, setItem] = useState('password')
    // State for toggles and privacy settings
    // const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    // const [privacy, setPrivacy] = useState({
    //     profileVisibility: 'everyone',
    //     messagePermission: 'everyone',
    // });

    // const handlePasswordChange = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     alert('Mật khẩu đã được thay đổi!');
    // };

    

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 dark:bg-[#0d1117] overflow-hidden" >
            <NavigationBar />
           <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 mt-[10vh]">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-white dark:bg-[#161b22] rounded-lg shadow p-6 h-fit">
                    <div className="mb-6">
                        <div className="w-16 h-16 rounded-full bg-gray-300 mx-auto mb-2" />
                        <div className="text-center font-semibold">Le Vinh Khanh</div>
                        <div className="text-center text-xs text-gray-500">@emkhanhhocgioi</div>
                    </div>
                    <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
                     <nav className="space-y-2">
                        <Button
                            onClick={() => setItem('password')}
                            className={`w-full text-left px-3 py-2 rounded font-medium ${
                                item === 'password'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white'
                                    : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Security
                        </Button>
                        <Button
                            onClick={() => setItem('notify')}
                            className={`w-full text-left px-3 py-2 rounded font-medium ${
                                item === 'notify'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white'
                                    : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Notifications
                        </Button>
                        <Button
                            onClick={() => setItem('privacy')}
                            className={`w-full text-left px-3 py-2 rounded font-medium ${
                                item === 'privacy'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white'
                                    : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Privacy
                        </Button>
                        <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
                        <Button
                            className="w-full text-left px-3 py-2 rounded font-medium bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Logout
                        </Button>
                    </nav>
                </aside>
                
                {/* Main Content */}
                
                <main className="flex-1 bg-white dark:bg-[#161b22] rounded-lg shadow p-8">
                    <h1 className="text-2xl font-bold mb-8">Cài đặt tài khoản</h1>
                    {item === 'password' && (
                        <PasswordChange />
                    )}
                    {item === 'notify' && (
                        <Notifications
                       
                        />
                    )}
                    {item === 'privacy' && (
                        <Privacy
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;