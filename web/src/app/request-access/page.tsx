import { Suspense } from "react";
import { RequestAccess } from "@/components/request-access";

export default function RequestAccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Suspense fallback={null}>
          <RequestAccess />
        </Suspense>
      </div>
    </div>
  );
}

