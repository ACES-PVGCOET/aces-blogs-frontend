import React from "react";
import { EditorialLabel } from "@/lib/types";

interface BadgePillProps {
  label: EditorialLabel;
}

export default function BadgePill({ label }: BadgePillProps) {
  const isAwarded = label.awarded;

  return (
    <span
      className={`tag-badge ${isAwarded ? "award" : ""}`}
      title={
        label.awardedBy
          ? `Accredited by ${label.awardedBy}${
              label.awardedAt
                ? " on " + new Date(label.awardedAt).toLocaleDateString()
                : ""
            }`
          : "Official Broadsheet Accolade"
      }
    >
      <span className="font-mono text-sm leading-none">{label.emoji}</span>
      <span>{label.text}</span>
    </span>
  );
}
