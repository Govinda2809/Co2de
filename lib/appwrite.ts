import { Client, Account, Databases, Storage, ID, Permission, Role } from 'appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Validate configuration
const isConfigured = !!(endpoint && projectId);

if (typeof window !== 'undefined' && !isConfigured) {
  console.warn(
    "⚠️ Appwrite not configured. Set NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID."
  );
}

// Initialize client only if configured
if (isConfigured) {
  client.setEndpoint(endpoint).setProject(projectId);
} else {
  // Set defaults to prevent crash, but operations will fail gracefully
  client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('placeholder');
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || '';
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

// Helper to check if Appwrite is properly configured
export const isAppwriteConfigured = (): boolean => {
  return !!(
    endpoint &&
    projectId &&
    DATABASE_ID &&
    COLLECTION_ID
  );
};

/**
 * Helper to create a document with proper error handling and permissions
 */
export async function createAnalysisDocument(userId: string, data: Record<string, any>) {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured. Check your environment variables.");
  }

  // Ensure all values are Appwrite-compatible (no undefined, arrays must be serialized)
  const sanitizedData: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue; // Skip undefined values
    }
    
    // Serialize arrays/objects to JSON strings for Appwrite
    if (Array.isArray(value) || (typeof value === 'object' && value !== null && !(value instanceof Date))) {
      sanitizedData[key] = JSON.stringify(value);
    } else if (value instanceof Date) {
      sanitizedData[key] = value.toISOString();
    } else {
      sanitizedData[key] = value;
    }
  }

  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      sanitizedData,
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
    
    return document;
  } catch (error: any) {
    console.error("Appwrite createDocument failed:", error);
    
    // Provide helpful error messages
    if (error.code === 401) {
      throw new Error("Authentication required. Please log in again.");
    } else if (error.code === 404) {
      throw new Error("Database or collection not found. Check your Appwrite configuration.");
    } else if (error.code === 400) {
      throw new Error(`Invalid data format: ${error.message}`);
    }
    
    throw error;
  }
}

/**
 * Helper to list user's analysis documents
 */
export async function listUserAnalyses(userId: string, limit = 50) {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured.");
  }

  try {
    const { Query } = await import('appwrite');
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ]
    );
    
    return response.documents;
  } catch (error: any) {
    console.error("Appwrite listDocuments failed:", error);
    throw error;
  }
}

/**
 * Helper to delete an analysis document
 */
export async function deleteAnalysisDocument(documentId: string) {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured.");
  }

  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, documentId);
    return true;
  } catch (error: any) {
    console.error("Appwrite deleteDocument failed:", error);
    throw error;
  }
}

export { client, ID, Permission, Role };
