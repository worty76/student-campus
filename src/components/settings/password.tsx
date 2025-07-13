import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Lock, Check, AlertCircle } from "lucide-react";

interface PasswordChangeForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
interface PasswordChangeProps {
    onSave: (settings: PasswordChangeForm) => void;
}
export const PasswordChange = ({ onSave }: PasswordChangeProps) => {
    const [form, setForm] = useState<PasswordChangeForm>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const validatePassword = (password: string): string[] => {
        const errors = [];
        if (password.length < 8) errors.push("Mật khẩu phải có ít nhất 8 ký tự");
        if (!/[A-Z]/.test(password)) errors.push("Mật khẩu phải có ít nhất 1 chữ hoa");
        if (!/[a-z]/.test(password)) errors.push("Mật khẩu phải có ít nhất 1 chữ thường");
        if (!/[0-9]/.test(password)) errors.push("Mật khẩu phải có ít nhất 1 số");
        return errors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        
        if (name === 'newPassword') {
            setErrors(validatePassword(value));
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (form.newPassword !== form.confirmPassword) {
            setErrors(["Mật khẩu mới và xác nhận mật khẩu không khớp"]);
            return;
        }
        
        const passwordErrors = validatePassword(form.newPassword);
        if (passwordErrors.length > 0) {
            setErrors(passwordErrors);
            return;
        }

        setIsLoading(true);
        try {
            await onSave({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setErrors([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        const checks = [
            password.length >= 8,
            /[A-Z]/.test(password),
            /[a-z]/.test(password),
            /[0-9]/.test(password),
            /[^A-Za-z0-9]/.test(password)
        ];
        return checks.filter(Boolean).length;
    };

    const passwordStrength = getPasswordStrength(form.newPassword);

    return (
        <div className="space-y-6">
            <form onSubmit={handlePasswordChange} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                        <Input
                            type={showPasswords.current ? "text" : "password"}
                            name="currentPassword"
                            value={form.currentPassword}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu hiện tại"
                            className="pr-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility('current')}
                        >
                            {showPasswords.current ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mật khẩu mới
                    </label>
                    <div className="relative">
                        <Input
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu mới"
                            className="pr-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility('new')}
                        >
                            {showPasswords.new ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {form.newPassword && (
                        <div className="mt-2">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-2 w-8 rounded-full ${
                                                level <= passwordStrength
                                                    ? passwordStrength <= 2
                                                        ? 'bg-red-500'
                                                        : passwordStrength <= 3
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                                    : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {passwordStrength <= 2 && 'Yếu'}
                                    {passwordStrength === 3 && 'Trung bình'}
                                    {passwordStrength >= 4 && 'Mạnh'}
                                </span>
                            </div>
                            
                            {/* Password Requirements */}
                            <div className="space-y-1 text-xs">
                                {[
                                    { check: form.newPassword.length >= 8, text: "Ít nhất 8 ký tự" },
                                    { check: /[A-Z]/.test(form.newPassword), text: "Ít nhất 1 chữ hoa" },
                                    { check: /[a-z]/.test(form.newPassword), text: "Ít nhất 1 chữ thường" },
                                    { check: /[0-9]/.test(form.newPassword), text: "Ít nhất 1 số" },
                                ].map((req, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        {req.check ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <div className="h-3 w-3 rounded-full border border-gray-300" />
                                        )}
                                        <span className={req.check ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                                            {req.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                        <Input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu mới"
                            className="pr-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility('confirm')}
                        >
                            {showPasswords.confirm ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                            )}
                        </button>
                    </div>
                    {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                        <p className="text-xs text-red-500 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Mật khẩu không khớp
                        </p>
                    )}
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                                    Vui lòng sửa các lỗi sau:
                                </h4>
                                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isLoading || errors.length > 0 || !form.currentPassword || !form.newPassword || !form.confirmPassword}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Đang cập nhật...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <Lock className="h-4 w-4 mr-2" />
                            Đổi mật khẩu
                        </div>
                    )}
                </Button>
            </form>
        </div>
    );
};

export default PasswordChange;