"use client";

import React from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function FeedbackPage() {
  return (
    <PageContainer>
      <PageContainer.Header>
        <h1 className="text-2xl font-semibold">We’d love your feedback</h1>
        <p className="text-muted-foreground">
          Found a bug, have a feature request, or just want to say hi? Let us know!
        </p>
      </PageContainer.Header>
      <PageContainer.Content className="flex flex-col gap-6">
        <p>
          Please open an issue on our GitHub repo or send us an email. We read every
          message.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="https://github.com/andresthedesigner/Easyprompt/issues" target="_blank">
              Open GitHub Issue
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="mailto:hello@easyprompt.ai">Email us</Link>
          </Button>
        </div>
      </PageContainer.Content>
    </PageContainer>
  );
}
