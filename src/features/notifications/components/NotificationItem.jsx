import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * @typedef {import('../../types').Notification} Notification
 */

const NotificationItem = ({ id, type, message, onDismiss }) => {
  let bgColor, textColor, borderColor, IconComponent;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      textColor = 'text-white';
      borderColor = 'border-green-600';
      IconComponent = CheckCircle;
      break;
    case 'error':
      bgColor = 'bg-red-500';
      textColor = 'text-white';
      borderColor = 'border-red-600';
      IconComponent = XCircle;
      break;
    case 'warning':
      bgColor = 'bg-yellow-400';
      textColor = 'text-gray-800'; // Changed for better contrast
      borderColor = 'border-yellow-500';
      IconComponent = AlertTriangle;
      break;
    case 'info':
      bgColor = 'bg-blue-500';
      textColor = 'text-white';
      borderColor = 'border-blue-600';
      IconComponent = Info;
      break;
    default:
      bgColor = 'bg-gray-700';
      textColor = 'text-white';
      borderColor = 'border-gray-800';
      IconComponent = Info;
  }

  return (
    <div
      className={`${bgColor} ${borderColor} border p-4 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-300 ease-out animate-in slide-in-from-right`}
      role="alert"
    >
      {IconComponent && <IconComponent className={`h-5 w-5 ${textColor}`} />}
      <p className={`text-sm font-medium flex-grow ${textColor}`}>{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className={`ml-auto p-1 rounded-full ${textColor} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

NotificationItem.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  message: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default NotificationItem;
