"use client";

import { PageContainer } from "@/components/layout/page-container";

export default function SearchPage() {
  return (
    <PageContainer
      background={{
        wavy: true,
        animation: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 3, delay: 1 },
        },
      }}
    >
      <PageContainer.Header>
        <h1 className="text-xl font-semibold">Search</h1>
      </PageContainer.Header>

      <PageContainer.Content>
        {/* TODO: Implement search functionality */}
        <div className="py-12 text-center text-muted-foreground">
          Search page coming soon.
        </div>
      </PageContainer.Content>
    </PageContainer>
  );
}
