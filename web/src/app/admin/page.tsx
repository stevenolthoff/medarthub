"use client";

import { useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

function StatusBadge({ status }: { status: string }) {
  const badgeStyles = useMemo(() => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700";
      case "REJECTED":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  }, [status]);

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 px-6 py-16 text-center">
      <p className="text-lg font-semibold text-gray-900">No access requests yet</p>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        New submissions will appear here as soon as applicants fill out the access form.
      </p>
    </div>
  );
}

function AdminDashboard() {
  const { data: requests, isLoading, error } = trpc.admin.listAccessRequests.useQuery();
  const utils = trpc.useUtils();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const approveMutation = trpc.admin.approveAndSendInvite.useMutation({
    onMutate: ({ accessRequestId }) => {
      setProcessingId(accessRequestId);
    },
    onSuccess: () => {
      utils.admin.listAccessRequests.invalidate();
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate({ accessRequestId: id });
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error.message}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium text-gray-600 sm:px-6">
              Applicant
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-gray-600 sm:px-6">
              Submitted
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-gray-600 sm:px-6">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-gray-600 sm:px-6">
              Invite
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium text-gray-600 sm:px-6">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((request) => {
            const createdAt = request.createdAt instanceof Date ? request.createdAt : new Date(request.createdAt);
            const inviteIssued = request.inviteCode
              ? `${request.inviteCode.code}${request.inviteCode.isUsed ? " (used)" : ""}`
              : "—";

            return (
              <tr key={request.id}>
                <td className="px-4 py-4 sm:px-6">
                  <div className="font-medium text-gray-900">{request.name}</div>
                  <div className="text-sm text-gray-500">{request.email}</div>
                  {request.message && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-semibold text-gray-600">Message:</span> {request.message}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-indigo-600">
                    <a href={request.artworkExampleUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      View portfolio
                    </a>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 sm:px-6">
                  {createdAt.toLocaleString()}
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 sm:px-6">{inviteIssued}</td>
                <td className="px-4 py-4 text-right sm:px-6">
                  {request.status === "PENDING" ? (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id || approveMutation.isPending}
                    >
                      {processingId === request.id ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 size-4" />
                          Approve & Send
                        </>
                      )}
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-400">No actions</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {approveMutation.error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {approveMutation.error.message}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { user, isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn || user?.role !== "ADMIN") {
    return (
      <div className="mx-auto flex h-[60vh] max-w-md flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
        <p className="mt-2 text-sm text-gray-600">
          You need an administrator account to review access requests.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Access Requests</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review pending submissions and send invitation emails directly from this dashboard.
        </p>
      </div>
      <AdminDashboard />
    </div>
  );
}

