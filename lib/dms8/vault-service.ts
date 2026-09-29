/**
 * DMS8 DIGITAL VAULT SERVICE
 * Hierarchical Travel Document Vault: Personal, Customer, Trip, Booking, Supplier, Org, Compliance.
 */

import { SEED_DMS_DOCUMENTS } from './registries';
import { DocumentRegistryItem, VaultType } from './types';

export interface VaultNode {
  id: string;
  name: string;
  type: 'FOLDER' | 'DOCUMENT';
  path: string;
  children?: VaultNode[];
  documentRef?: DocumentRegistryItem;
}

export class DMS8VaultService {
  private static documents: DocumentRegistryItem[] = [...SEED_DMS_DOCUMENTS];

  /**
   * Get all registered documents
   */
  static getAllDocuments(): DocumentRegistryItem[] {
    return this.documents;
  }

  /**
   * Get Document by ID
   */
  static getDocumentById(documentId: string): DocumentRegistryItem | undefined {
    return this.documents.find(d => d.documentId === documentId);
  }

  /**
   * Register or Upload a new Document into the Registry
   */
  static registerDocument(doc: DocumentRegistryItem): DocumentRegistryItem {
    this.documents.unshift(doc);
    return doc;
  }

  /**
   * Update Document in Registry
   */
  static updateDocument(documentId: string, updates: Partial<DocumentRegistryItem>): DocumentRegistryItem {
    const idx = this.documents.findIndex(d => d.documentId === documentId);
    if (idx === -1) throw new Error(`Document ${documentId} not found`);
    this.documents[idx] = { ...this.documents[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.documents[idx];
  }

  /**
   * Get Structured Vault Hierarchy for an Entity (e.g. Customer Rahul Kumar or Supplier CGH Earth)
   */
  static getVaultHierarchy(vaultType: VaultType, entityId?: string): VaultNode {
    const entityDocs = entityId 
      ? this.documents.filter(d => d.entityId === entityId || d.ownerId === entityId)
      : this.documents;

    if (vaultType === 'CUSTOMER_VAULT') {
      const ownerName = entityDocs[0]?.ownerName || 'Customer Vault';
      return {
        id: `vault-cust-${entityId || 'all'}`,
        name: ownerName,
        type: 'FOLDER',
        path: `/${ownerName}`,
        children: [
          {
            id: 'folder-passports',
            name: 'Passports & Visas',
            type: 'FOLDER',
            path: `/${ownerName}/Passports & Visas`,
            children: entityDocs
              .filter(d => d.documentType === 'PASSPORT' || d.documentType === 'VISA')
              .map(d => ({
                id: d.documentId,
                name: d.title,
                type: 'DOCUMENT',
                path: `/${ownerName}/Passports & Visas/${d.title}`,
                documentRef: d
              }))
          },
          {
            id: 'folder-tickets',
            name: 'Tickets & Insurance',
            type: 'FOLDER',
            path: `/${ownerName}/Tickets & Insurance`,
            children: entityDocs
              .filter(d => d.documentType === 'AIR_TICKET' || d.documentType === 'INSURANCE')
              .map(d => ({
                id: d.documentId,
                name: d.title,
                type: 'DOCUMENT',
                path: `/${ownerName}/Tickets & Insurance/${d.title}`,
                documentRef: d
              }))
          },
          {
            id: 'folder-trips',
            name: 'Trips',
            type: 'FOLDER',
            path: `/${ownerName}/Trips`,
            children: [
              {
                id: 'folder-trip-active',
                name: 'Dubai 2027 Excursion',
                type: 'FOLDER',
                path: `/${ownerName}/Trips/Dubai 2027`,
                children: entityDocs
                  .filter(d => d.tags.some(t => t.includes('dubai')))
                  .map(d => ({
                    id: d.documentId,
                    name: d.title,
                    type: 'DOCUMENT',
                    path: `/${ownerName}/Trips/Dubai 2027/${d.title}`,
                    documentRef: d
                  }))
              }
            ]
          }
        ]
      };
    }

    if (vaultType === 'SUPPLIER_VAULT') {
      return {
        id: `vault-supp-${entityId || 'all'}`,
        name: 'Supplier Partner Vault',
        type: 'FOLDER',
        path: '/Suppliers',
        children: [
          {
            id: 'folder-contracts',
            name: 'Master Agreements & Contracts',
            type: 'FOLDER',
            path: '/Suppliers/Contracts',
            children: entityDocs
              .filter(d => d.category === 'SUPPLIER')
              .map(d => ({
                id: d.documentId,
                name: d.title,
                type: 'DOCUMENT',
                path: `/Suppliers/Contracts/${d.title}`,
                documentRef: d
              }))
          }
        ]
      };
    }

    // Default Organization Vault
    return {
      id: 'vault-org-root',
      name: 'Travel Planet Enterprise Vault',
      type: 'FOLDER',
      path: '/Enterprise Vault',
      children: [
        {
          id: 'folder-customers',
          name: 'Customer Vaults',
          type: 'FOLDER',
          path: '/Enterprise Vault/Customers',
          children: this.documents.filter(d => d.category === 'CUSTOMER').map(d => ({
            id: d.documentId,
            name: d.title,
            type: 'DOCUMENT',
            path: `/Enterprise Vault/Customers/${d.title}`,
            documentRef: d
          }))
        },
        {
          id: 'folder-bookings',
          name: 'Booking & Operations Vaults',
          type: 'FOLDER',
          path: '/Enterprise Vault/Bookings',
          children: this.documents.filter(d => d.category === 'BOOKING').map(d => ({
            id: d.documentId,
            name: d.title,
            type: 'DOCUMENT',
            path: `/Enterprise Vault/Bookings/${d.title}`,
            documentRef: d
          }))
        },
        {
          id: 'folder-compliance',
          name: 'Regulatory & Compliance Vault',
          type: 'FOLDER',
          path: '/Enterprise Vault/Compliance',
          children: this.documents.filter(d => d.classification === 'RESTRICTED').map(d => ({
            id: d.documentId,
            name: d.title,
            type: 'DOCUMENT',
            path: `/Enterprise Vault/Compliance/${d.title}`,
            documentRef: d
          }))
        }
      ]
    };
  }
}
