import React, { Suspense } from "react";
import WriterProfileView from "@/components/WriterProfileView";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Fellow Profile & Dispatches · ACES Broadsheet Gazette",
};

async function ProfilePageInner({ params }: ProfilePageProps) {
  const { id } = await params;
  return <WriterProfileView userId={id} />;
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center font-mono text-sm uppercase">
          RETRIEVING ACES FELLOW CREDENTIALS...
        </div>
      }
    >
      <ProfilePageInner params={params} />
    </Suspense>
  );
}
