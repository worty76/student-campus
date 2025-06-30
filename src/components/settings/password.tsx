import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
            confirmPassword: form.confirmPassword,
        });
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Thay đổi mật khẩu</h2>
            <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
                <Input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    placeholder="Mật khẩu hiện tại"
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <Input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Mật khẩu mới"
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <Input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <Button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Đổi mật khẩu
                </Button>
            </form>
        </div>
    );
};

export default PasswordChange;