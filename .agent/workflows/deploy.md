---
description: Steps to deploy CO2DE to Vercel and production Appwrite
---

// turbo-all

### 🚀 Production Deployment Checklist

1. **Vercel Setup**
   - Push your code to a GitHub repository.
   - Link the repository to a new Vercel Project.
   - Add the following Environment Variables in Vercel Dashboard:
     - `NEXT_PUBLIC_APPWRITE_ENDPOINT`: `https://cloud.appwrite.io/v1`
     - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite Project ID
     - `NEXT_PUBLIC_APPWRITE_DATABASE_ID`: Your Database ID
     - `NEXT_PUBLIC_APPWRITE_COLLECTION_ID`: Your Collection ID
     - `NEXT_PUBLIC_APPWRITE_BUCKET_ID`: Your Storage Bucket ID
     - `OPENROUTER_API_KEY`: Your OpenRouter Key (for REAL AI Analysis)

2. **Appwrite Console Configuration**
   - **Platforms**: Add a new **Web App** platform with your Vercel deployment URL (e.g., `co2de.vercel.app`) to enable CORS.
   - **Authentication**: Enable Email/Password auth in the 'Auth' section.
   - **Permissions**: Ensure the `analyses` collection has **users** group permission for (Create, Read, Update, Delete).

3. **VS Code Extension Build**
   - Run `npm install` in the `/extension` directory.
   - Use `vsce package` to generate a `.vsix` file for distribution.

4. **Monitoring**
   - Use the Vercel Logs to monitor the `/api/analyze` route for any AI parsing errors.
   - Check Appwrite usage metrics to ensure storage limits are not exceeded.

**Your application is now ready for world-wide impact!** 🌍⚡
