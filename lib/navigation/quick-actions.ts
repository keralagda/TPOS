/**
 * Travel Planet OS — Universal Quick Action System
 * Universal Create Button ("+ New") actions for instant business velocity.
 */

import { QuickActionItem } from './types';

export const UNIVERSAL_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'act-new-customer',
    label: 'New Customer',
    actionCode: 'customers.create',
    icon: 'UserPlus',
    targetUrl: '/crm/leads?action=new-customer',
    permission: 'customers.create',
    category: 'Sales',
    shortcut: 'Alt+C',
  },
  {
    id: 'act-new-trip',
    label: 'New Trip',
    actionCode: 'trips.create',
    icon: 'Compass',
    targetUrl: '/trip-planner',
    permission: 'trips.manage',
    category: 'Operations',
    shortcut: 'Alt+T',
  },
  {
    id: 'act-new-booking',
    label: 'New Booking',
    actionCode: 'bookings.create',
    icon: 'CheckSquare',
    targetUrl: '/operations/control-tower?action=new-booking',
    permission: 'bookings.create',
    category: 'Operations',
    shortcut: 'Alt+B',
  },
  {
    id: 'act-new-package',
    label: 'New Package',
    actionCode: 'packages.create',
    icon: 'Package',
    targetUrl: '/packages?action=new-package',
    permission: 'inventory.view',
    category: 'Content',
    shortcut: 'Alt+P',
  },
  {
    id: 'act-upload-doc',
    label: 'Upload Document',
    actionCode: 'documents.upload',
    icon: 'UploadCloud',
    targetUrl: '/admin/dms?action=upload',
    permission: 'trips.manage',
    category: 'Compliance',
    shortcut: 'Alt+U',
  },
  {
    id: 'act-new-campaign',
    label: 'Create Campaign',
    actionCode: 'campaigns.create',
    icon: 'Megaphone',
    targetUrl: '/admin/campaign-studio?action=new-campaign',
    permission: 'marketing.view',
    category: 'Marketing',
    shortcut: 'Alt+M',
  },
];
