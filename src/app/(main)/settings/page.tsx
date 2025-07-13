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
import { 
  Shield, 
  Lock, 
  LogOut, 
  User, 
  Mail, 
  CheckCircle,
  Loader2,

} from 'lucide-react';
import './settings.css';
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
        <div className="min-h-screen bg-[#F1F1E6]">
            <NavigationBar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[12vh] pb-8">
              
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
                    {/* Sidebar */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl border border-[#F5F9FF] overflow-hidden sticky top-24 hover-lift transition-all-smooth">
                            {/* Profile Section */}
                            <div className="p-6 sm:p-8 bg-[#F5F9FF] border-b border-[#0694FA]/10">
                                <div className="flex flex-col items-center text-center animate-fade-in-up">
                                    <div className="relative mb-6">
                                        {userData?.avatar_link ? (
                                            <div className="relative">
                                                <Image
                                                    width={100}
                                                    height={100}
                                                    src={userData.avatar_link}
                                                    alt="Avatar"
                                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-2xl transition-all-smooth hover:shadow-3xl hover:scale-105"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0694FA] flex items-center justify-center border-4 border-white shadow-2xl transition-all-smooth hover:shadow-3xl hover:scale-105">
                                                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full border-3 border-white animate-pulse-gentle shadow-lg"></div>
                                    </div>
                                    <h3 className="font-bold text-[#1E293B] text-lg sm:text-xl mb-2">
                                        {userData?.username || 'Tên người dùng'}
                                    </h3>
                                    <div className="flex items-center text-sm sm:text-base text-[#1E293B]/60 mb-4">
                                        <Mail className="w-4 h-4 mr-2" />
                                        <span className="truncate max-w-[200px]">{userData?.email || 'Email'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                        <div className="bg-[#0694FA]/10 rounded-2xl p-3 text-center">
                                            <div className="text-lg font-bold text-[#1E293B]">{userData?.Year || 'N/A'}</div>
                                            <div className="text-xs text-[#1E293B]/60">Năm học</div>
                                        </div>
                                        <div className="bg-[#1E293B]/10 rounded-2xl p-3 text-center">
                                            <div className="text-lg font-bold text-[#1E293B]">{userData?.Major?.slice(0, 6) || 'N/A'}</div>
                                            <div className="text-xs text-[#1E293B]/60">Ngành</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Navigation */}
                            <nav className="p-4 sm:p-6 space-y-2">
                                <Button
                                    onClick={() => setItem('password')}
                                    className={`w-full justify-start px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base group ${
                                        item === 'password'
                                            ? 'bg-[#0694FA] text-white shadow-lg transform scale-[1.02]'
                                            : 'bg-transparent text-[#1E293B] hover:bg-[#0694FA]/10 hover:scale-[1.01]'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-all ${
                                        item === 'password' 
                                            ? 'bg-white/20' 
                                            : 'bg-[#0694FA]/10 group-hover:bg-[#0694FA]/20'
                                    }`}>
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    Bảo mật
                                </Button>
                                <Button
                                    onClick={() => setItem('privacy')}
                                    className={`w-full justify-start px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base group ${
                                        item === 'privacy'
                                            ? 'bg-[#0694FA] text-white shadow-lg transform scale-[1.02]'
                                            : 'bg-transparent text-[#1E293B] hover:bg-[#0694FA]/10 hover:scale-[1.01]'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-all ${
                                        item === 'privacy' 
                                            ? 'bg-white/20' 
                                            : 'bg-[#0694FA]/10 group-hover:bg-[#0694FA]/20'
                                    }`}>
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    Quyền riêng tư
                                </Button>
                                
                                <div className="my-6">
                                    <div className="h-px bg-[#0694FA]/20"></div>
                                </div>
                                
                                <Button
                                    className="w-full justify-start px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold text-[#1E293B] bg-white hover:bg-[#F5F9FF] transition-all duration-300 text-sm sm:text-base group hover:scale-[1.01] border border-[#F5F9FF]"
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                >
                                    <div className="w-8 h-8 rounded-xl bg-[#F5F9FF] group-hover:bg-[#E5E7EB] flex items-center justify-center mr-3 transition-all">
                                        {loggingOut ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-[#0694FA]" />
                                        ) : (
                                            <LogOut className="w-4 h-4 text-[#0694FA]" />
                                        )}
                                    </div>
                                    Đăng xuất
                                </Button>
                            </nav>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-3xl shadow-xl border border-[#F5F9FF] overflow-hidden hover-lift transition-all-smooth">
                            <div className="p-6 sm:p-8 lg:p-10 custom-scrollbar">
                                {item === 'password' && (
                                    <div className="animate-in fade-in duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center mb-8 animate-fade-in-up">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0694FA] rounded-2xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 shadow-lg">
                                                <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-2">
                                                    Bảo mật tài khoản
                                                </h2>
                                                <p className="text-base sm:text-lg text-[#1E293B]/60 leading-relaxed">
                                                    Thay đổi mật khẩu để bảo vệ tài khoản của bạn khỏi các truy cập trái phép.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-[#F5F9FF] rounded-2xl p-6 border border-[#0694FA]/10">
                                            <PasswordChange
                                                onSave={({ currentPassword, newPassword, confirmPassword }) =>
                                                    handleSavePassword(newPassword, currentPassword, confirmPassword)
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                
                                {item === 'privacy' && (
                                    <div className="animate-in fade-in duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center mb-8 animate-fade-in-up">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 shadow-lg">
                                                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-2">
                                                    Quyền riêng tư
                                                </h2>
                                                <p className="text-base sm:text-lg text-[#1E293B]/60 leading-relaxed">
                                                    Quản lý quyền riêng tư: Ai có thể xem hồ sơ, gửi tin nhắn hoặc tìm thấy bạn trên hệ thống.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                                            <Privacy
                                                onSave={(settings) =>
                                                    handleSavePrivacy({
                                                        profilePrivacy: settings.profileVisibility,
                                                        messagePrivacy: settings.messagePermission,
                                                        notifications: settings.notifications, 
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/20 p-4">
                    <div className="bg-white px-8 sm:px-10 py-6 sm:py-8 rounded-3xl shadow-2xl border border-green-200 animate-zoom-in max-w-sm w-full">
                        <div className="flex items-center justify-center flex-col text-center">
                            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-green-700 text-lg mb-2">Thành công!</h3>
                            <p className="text-green-600 text-sm">Cài đặt đã được lưu thành công</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Logout Loading */}
            {loggingOut && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/30 p-4">
                    <div className="bg-white px-8 sm:px-10 py-6 sm:py-8 rounded-3xl shadow-2xl flex flex-col items-center animate-zoom-in max-w-sm w-full">
                        <div className="w-16 h-16 bg-[#0694FA] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <h3 className="font-bold text-[#1E293B] text-lg mb-2">Đang đăng xuất...</h3>
                        <p className="text-[#1E293B]/60 text-sm text-center">Vui lòng đợi trong giây lát</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;