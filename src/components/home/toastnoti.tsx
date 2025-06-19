import React from 'react';
import { X } from 'lucide-react';

interface NotiToastProps {
  title?: string;
  message?: string;
  avatar?: string;
  color?: string; // ví dụ: "bg-blue-500"
  onClose?: () => void;
  showProgress?: boolean;
}

const Toast: React.FC<NotiToastProps> = ({
  title ,
  message ,
  avatar = "👤",
  color = "bg-blue-500",
  onClose = () => {},
  showProgress = true
}) => {
  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 p-3 min-w-80 max-w-sm">
      <div className="flex items-start space-x-3">
        {/* Avatar/Icon */}
        <div className={`${color} rounded-full p-2 flex items-center justify-center flex-shrink-0`}>
          <span className="text-sm">{avatar}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white truncate">
              {title}
            </h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-300 mt-1 line-clamp-2">
            {message}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mt-3 bg-gray-700 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full ${color} rounded-full`}
            style={{
              animation: 'shrink 5s linear forwards'
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
