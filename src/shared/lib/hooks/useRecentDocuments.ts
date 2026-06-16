import { useState, useCallback, useEffect } from 'react';

const RECENT_DOCUMENTS_KEY = 'recent_documents';
const MAX_RECENT_DOCUMENTS = 5;

/**
 * Recent document entry stored in localStorage (new format)
 */
export interface RecentDocumentEntry {
    uuid: string;
    visitedAt: string;
}

/**
 * Old format for migration
 */
interface OldRecentDocument {
    uuid: string;
    title: string;
    icon?: string;
    color?: string;
    collectionUuid?: string;
    collectionTitle?: string;
    visitedAt: string;
}

/**
 * Migrate old format to new format
 */
function migrateOldFormat(stored: string): RecentDocumentEntry[] {
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
            const first = parsed[0];
            // Check if it's old format (has title field)
            if ('title' in first) {
                console.log('[useRecentDocuments] Migrating from old format');
                return (parsed as OldRecentDocument[]).map(doc => ({
                    uuid: doc.uuid,
                    visitedAt: doc.visitedAt,
                }));
            }
        }
        return parsed;
    } catch {
        return [];
    }
}

/**
 * Hook for managing recent documents in localStorage
 * Only stores UUIDs and timestamps - actual document data is fetched via RTK Query
 * @returns recent document UUIDs array and functions to add/remove documents
 */
export function useRecentDocuments() {
    const [recentDocuments, setRecentDocuments] = useState<RecentDocumentEntry[]>(() => {
        try {
            const stored = localStorage.getItem(RECENT_DOCUMENTS_KEY);
            if (!stored) return [];
            
            // Try migration from old format
            return migrateOldFormat(stored);
        } catch {
            return [];
        }
    });

    // Sync with localStorage
    useEffect(() => {
        try {
            localStorage.setItem(RECENT_DOCUMENTS_KEY, JSON.stringify(recentDocuments));
        } catch (err) {
            console.error('Failed to save recent documents:', err);
        }
    }, [recentDocuments]);

    /**
     * Add a document to recent list (or move to top if already exists)
     * @param uuid - Document UUID
     */
    const addRecentDocument = useCallback((uuid: string) => {
        setRecentDocuments((prev) => {
            // Remove existing entry if present
            const filtered = prev.filter((d) => d.uuid !== uuid);
            
            // Add new entry at the beginning
            const newEntry: RecentDocumentEntry = {
                uuid,
                visitedAt: new Date().toISOString(),
            };
            
            // Keep only MAX_RECENT_DOCUMENTS
            return [newEntry, ...filtered].slice(0, MAX_RECENT_DOCUMENTS);
        });
    }, []);

    /**
     * Remove a document from recent list
     * @param documentUuid - Document UUID to remove
     */
    const removeRecentDocument = useCallback((documentUuid: string) => {
        setRecentDocuments((prev) => prev.filter((d) => d.uuid !== documentUuid));
    }, []);

    /**
     * Clear all recent documents
     */
    const clearRecentDocuments = useCallback(() => {
        setRecentDocuments([]);
    }, []);

    // Return UUIDs in order for querying
    const recentDocumentUuids = recentDocuments.map(d => d.uuid);

    return {
        recentDocuments,
        recentDocumentUuids,
        addRecentDocument,
        removeRecentDocument,
        clearRecentDocuments,
    };
}
