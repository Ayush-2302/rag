import React from 'react';
import { Icon as IconifyIcon, addCollection } from '@iconify/react';
import lucideData from '@iconify-json/lucide/icons.json';

// Pre-load all 1,900+ Lucide icons offline into Iconify
addCollection(lucideData);

/**
 * Universal Icon component powered by Iconify.
 * Can render any Iconify icon name (e.g., 'lucide:home', 'lucide:check', etc.)
 */
export function Icon({ icon, size = 16, className = '', ...props }) {
  return (
    <IconifyIcon
      icon={icon}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    />
  );
}

// Re-export IconifyIcon as a direct alias
export { IconifyIcon };

function createIcon(iconName) {
  const IconComponent = ({ size = 16, className = '', ...props }) => (
    <Icon icon={`lucide:${iconName}`} size={size} className={className} {...props} />
  );
  IconComponent.displayName = `Icon(${iconName})`;
  return IconComponent;
}

export const HomeIcon = createIcon('home');
export const UploadIcon = createIcon('upload');
export const DatabaseIcon = createIcon('database');
export const FileTextIcon = createIcon('file-text');
export const SearchIcon = createIcon('search');
export const SendIcon = createIcon('send');
export const XIcon = createIcon('x');
export const PlusIcon = createIcon('plus');
export const CheckIcon = createIcon('check');
export const CheckCircleIcon = createIcon('check-circle');
export const CopyIcon = createIcon('copy');
export const AlertIcon = createIcon('alert-circle');
export const AlertTriangleIcon = createIcon('alert-triangle');
export const InfoIcon = createIcon('info');
export const TrashIcon = createIcon('trash-2');
export const MenuIcon = createIcon('menu');
export const PanelLeftIcon = createIcon('panel-left');
export const ChevronDownIcon = createIcon('chevron-down');
export const ChevronRightIcon = createIcon('chevron-right');
export const HelpCircleIcon = createIcon('help-circle');
export const UserIcon = createIcon('user');
export const LogOutIcon = createIcon('log-out');
export const LogInIcon = createIcon('log-in');
export const RefreshIcon = createIcon('refresh-cw');
export const SettingsIcon = createIcon('settings');
export const SparklesIcon = createIcon('sparkles');
export const FolderIcon = createIcon('folder');
export const ExternalLinkIcon = createIcon('external-link');
export const LayersIcon = createIcon('layers');
export const UsersIcon = createIcon('users');
export const UserPlusIcon = createIcon('user-plus');
export const ShieldIcon = createIcon('shield');
export const ShieldCheckIcon = createIcon('shield-check');
export const UserXIcon = createIcon('user-x');
export const UserCheckIcon = createIcon('user-check');

export default Icon;
