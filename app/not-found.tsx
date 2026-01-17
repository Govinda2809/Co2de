import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</h1>
        <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">Contact Support</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
