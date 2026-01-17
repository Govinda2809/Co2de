import { Client, Account, Databases, Storage, ID, Permission, Role, Query } from 'appwrite';

// Configuration
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || '';
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

// Initialize client
const client = new Client();

if (ENDPOINT && PROJECT_ID) {
  client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
}

// Export services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

/**
 * Check if Appwrite is properly configured
 */
export function isAppwriteConfigured(): boolean {
  return !!(ENDPOINT && PROJECT_ID && DATABASE_ID && COLLECTION_ID);
}

/**
 * Sanitize data for Appwrite - converts complex types to strings
 */
function sanitizeForAppwrite(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip undefined/null
    if (value === undefined || value === null) {
      continue;
    }
    
    // Handle different types
    if (typeof value === 'boolean') {
      result[key] = value;
    } else if (typeof value === 'number') {
      result[key] = value;
    } else if (typeof value === 'string') {
      result[key] = value;
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      // Serialize arrays to JSON
      result[key] = JSON.stringify(value);
    } else if (typeof value === 'object') {
      // Serialize objects to JSON
      result[key] = JSON.stringify(value);
    }
  }
  
  return result;
}

/**
 * Create an analysis document
 */
export async function createAnalysisDocument(userId: string, data: Record<string, any>) {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite not configured. Check environment variables.");
  }

  const sanitized = sanitizeForAppwrite(data);
  
  try {
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      sanitized,
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
  } catch (error: any) {
    console.error("createAnalysisDocument error:", error);
    
    if (error.code === 401) {
      throw new Error("Not authenticated. Please log in.");
    }
    if (error.code === 404) {
      throw new Error("Collection not found. Check COLLECTION_ID.");
    }
    if (error.code === 400) {
      throw new Error(`Invalid data: ${error.message}`);
    }
    
    throw new Error(error.message || "Failed to save analysis.");
  }
}

/**
 * List user's analyses
 */
export async function listUserAnalyses(userId: string, limit = 50) {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite not configured.");
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(limit)
      ]
    );
    return response.documents;
  } catch (error: any) {
    console.error("listUserAnalyses error:", error);
    
    if (error.code === 404) {
      throw new Error("Collection not found.");
    }
    
    throw new Error(error.message || "Failed to fetch analyses.");
  }
}

/**
 * Delete an analysis document
 */
export async function deleteAnalysisDocument(documentId: string) {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite not configured.");
  }

  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, documentId);
    return true;
  } catch (error: any) {
    console.error("deleteAnalysisDocument error:", error);
    throw new Error(error.message || "Failed to delete analysis.");
  }
}

export { client, ID, Permission, Role, Query };
