import React from "react";
import WriterProfileView from "@/components/WriterProfileView";

export const metadata = {
  title: "Writer Profile & Editorial Workbench · ACES Gazette",
  description: "Academic Press Credential, Editorial Workbench, and Dispatches Ledger for ACES Fellows.",
};

export default function ProfilePage() {
  return <WriterProfileView userId="writer-101" />;
}
