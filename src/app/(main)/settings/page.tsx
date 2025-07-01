'use client';
import React, { useState, useEffect } from 'react';
import NavigationBar from '@/app/(main)/layouts/navbar';
import { Button } from '@/components/ui/button';
import PasswordChange from '@/components/settings/password';
import Image from 'next/image';
import Privacy from '@/components/settings/privacy';
import axios from 'axios';
import { BASEURL } from '@/app/constants/url';
interface UserdataProps {
  id?: string,
  username: string,
  Year: string,
  Major: string,
  email: string,
  status:string,
  Faculty: string,
  avatar?: string,
  avatar_link?: string,
  friends?: string[]
  profilePrivacy?: string;
  messagePrivacy?: string;
  notifcationSettings?: string;
}
const SettingsPage = () => {
    const [item, setItem] = useState('password');
    const [showSuccess, setShowSuccess] = useState(false);
    const [userData, setUserData] = useState<UserdataProps | null>(null);
    const getUserData = async () => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `${BASEURL}/api/get/userinfo/` + userId,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.status === 200) {
        const userData = response.data.resUser;
        setUserData(userData);

        console.log(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
    const handleSavePrivacy = async (privacySetting: { profilePrivacy: string; messagePrivacy: string; notifications: string }) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!userId || !token) {
                alert('Bạn chưa đăng nhập!');
                return;
            }

            const res = await axios.put(
                `${BASEURL}/api/update/privacy/${userId}`,
                {
                    profileVisibility: privacySetting.profilePrivacy,
                    messagePermission: privacySetting.messagePrivacy,
                    notifications: privacySetting.notifications,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 200) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            } else {
                alert(res.data.message || 'Có lỗi xảy ra khi cập nhật quyền riêng tư');
            }
        } catch (error) {
            alert(error || 'Lỗi kết nối máy chủ');
        }
    };

    const handleSavePassword = async (newPassword: string ,oldPassword:string,confirmPassword:string) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!userId || !token) {
                alert('Bạn chưa đăng nhập!');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
                return;
            }

            const res = await axios.put(
                `${BASEURL}/api/update/password/${userId}`,
                {
                    newPassword: newPassword,
                    oldPassword: oldPassword
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 200) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            } else {
                alert(res.data.message || 'Có lỗi xảy ra khi cập nhật mật khẩu');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            
        }
    }

    useEffect(() => {
        getUserData();
    }, []);
        
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 dark:bg-[#0d1117] overflow-hidden" >
            <NavigationBar />
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 mt-[10vh]">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-white dark:bg-[#161b22] rounded-lg shadow p-6 h-fit">
                    <div className="mb-6 flex flex-col items-center">
                        {userData?.avatar_link ? (
                            <Image
                                width={64}
                                height={64}
                                src={userData.avatar_link}
                                alt="Avatar"
                                className="w-16 h-16 rounded-full object-cover mb-2"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-300 mb-2" />
                        )}
                        <div className="text-center font-semibold">{userData?.username || 'Tên người dùng'}</div>
                        <div className="text-center text-xs text-gray-500">{userData?.email || 'Email'}</div>
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
                    <h1 className="text-2xl font-bold mb-2">Cài đặt tài khoản</h1>
                    {/* Details for each section */}
                    {item === 'password' && (
                        <>
                            <p className="mb-8 text-gray-600 dark:text-gray-400">
                                Thay đổi mật khẩu để bảo vệ tài khoản của bạn khỏi các truy cập trái phép.
                            </p>
                            <PasswordChange
                                onSave={({ currentPassword, newPassword, confirmPassword }) =>
                                    handleSavePassword(newPassword, currentPassword, confirmPassword)
                                }
                            />
                        </>
                    )}
                
                    {item === 'privacy' && (
                        <>
                            <p className="mb-8 text-gray-600 dark:text-gray-400">
                                Quản lý quyền riêng tư: Ai có thể xem hồ sơ, gửi tin nhắn hoặc tìm thấy bạn trên hệ thống.
                            </p>
                            <Privacy
                                onSave={(settings) =>
                                    handleSavePrivacy({
                                        profilePrivacy: settings.profileVisibility,
                                        messagePrivacy: settings.messagePermission,
                                        notifications: settings.notifications, 
                                    })
                                }
                            />
                        </>
                    )}
                    {showSuccess && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 px-8 py-6 rounded shadow-lg border border-blue-500 text-blue-700 font-semibold">
                                Lưu thành công!
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;