'use client';
import React, { useState, useEffect } from 'react';
import NavigationBar from '@/app/(main)/layouts/navbar';
import { Button } from '@/components/ui/button';
import PasswordChange from '@/components/settings/password';
import Image from 'next/image';
import Privacy from '@/components/settings/privacy';
import axios from 'axios';
import { BASEURL } from '@/app/constants/url';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/app/context/websocket.contex';
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
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();
    const { disconnect } = useWebSocket();
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

    const handleLogout = () => {
        setLoggingOut(true);
        disconnect();
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userdata');
            localStorage.removeItem('friends');
            router.push('/login');
        }, 1500); // Đợi 1.5s cho UX mượt
    };

    useEffect(() => {
        getUserData();
    }, []);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
        }
      }, []);
        
    return (
        <div className="min-h-screen dark:bg-[#0d1117] overflow-hidden">
            <NavigationBar />
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 mt-[10vh]">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-[#F8FAFC] dark:bg-[#161b22] rounded-lg shadow p-6 h-fit">
                    <div className="mb-6 flex flex-col items-center">
                        {/* Header card */}
                        <div className="w-full mb-4 rounded bg-[#E2E8F0] dark:bg-[#161b22] py-2 flex flex-col items-center">
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
                            <div className="text-center font-semibold text-[#1D4ED8]">{userData?.username || 'Tên người dùng'}</div>
                            <div className="text-center text-xs text-gray-500">{userData?.email || 'Email'}</div>
                        </div>
                    </div>
                    <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
                    <nav className="space-y-2">
                        <Button
                            onClick={() => setItem('password')}
                            className={`w-full text-left px-3 py-2 rounded font-medium ${
                                item === 'password'
                                    ? 'bg-[#E0F2FE] text-[#1D4ED8]'
                                    : 'bg-transparent text-[#1D4ED8] hover:bg-[#E0F2FE]'
                            }`}
                        >
                            Security
                        </Button>
                        <Button
                            onClick={() => setItem('privacy')}
                            className={`w-full text-left px-3 py-2 rounded font-medium ${
                                item === 'privacy'
                                    ? 'bg-[#E0F2FE] text-[#7C3AED]'
                                    : 'bg-transparent text-[#7C3AED] hover:bg-[#E0F2FE]'
                            }`}
                        >
                            Privacy
                        </Button>
                        <hr className="border-gray-300 dark:border-gray-700 border-2 my-4" />
                        <Button
                            className="w-full text-left px-3 py-2 rounded font-medium bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={handleLogout}
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
            {loggingOut && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-gray-900 px-8 py-6 rounded shadow-lg flex flex-col items-center">
                        <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">Đang đăng xuất...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;