import { useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import {
    Page,
    Layout,
    Card,
    Text,
    BlockStack,
    InlineStack,
    Badge,
    Button,
    ProgressBar,
    Icon,
    Thumbnail,
    ResourceList,
    ResourceItem,
    EmptyState
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { supabase } from "../supabase";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;

    // We fetch the shopify user connected to this domain
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('store_website', shopDomain)
        .single();

    if (!profile) {
        return redirect("/app");
    }

    let usageCount = 0;
    let recentLogs = [];

    // Find their recent try-on logs
    const { data: logs } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

    if (logs) recentLogs = logs;

    // Count their total usage
    const { count } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

    if (count) usageCount = count;

    return {
        shopDomain,
        profile,
        usageCount,
        recentLogs
    };
};

export default function Dashboard() {
    const { shopDomain, profile, usageCount, recentLogs } = useLoaderData();

    // If the profile doesn't exist, we fallback to 0
    const credits = profile?.credits || 0;

    return (
        <Page fullWidth>
            <TitleBar title="DrOutfit Dashboard" />

            <BlockStack gap="500">
                <Layout>
                    {/* Credit Overview Card */}
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="400">
                                <InlineStack align="space-between">
                                    <Text variant="headingMd" as="h2">
                                        Account Overview
                                    </Text>
                                    <Badge tone={credits > 0 ? "success" : "critical"}>
                                        {credits > 0 ? 'Active' : 'Out of Credits'}
                                    </Badge>
                                </InlineStack>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                                    <div style={{ padding: '16px', background: '#f4f6f8', borderRadius: '8px' }}>
                                        <Text variant="bodySm" tone="subdued">Available Credits</Text>
                                        <Text variant="headingLg" as="p">{credits}</Text>
                                    </div>
                                    <div style={{ padding: '16px', background: '#f4f6f8', borderRadius: '8px' }}>
                                        <Text variant="bodySm" tone="subdued">Total Try-Ons Generated</Text>
                                        <Text variant="headingLg" as="p">{usageCount}</Text>
                                    </div>
                                </div>

                                {credits < 50 && (
                                    <div style={{ marginTop: '16px' }}>
                                        <BlockStack gap="200">
                                            <InlineStack align="space-between">
                                                <Text variant="bodySm">Credit Usage Warning</Text>
                                                <Text variant="bodySm">{credits} remaining</Text>
                                            </InlineStack>
                                            <ProgressBar progress={Math.max(5, (credits / 100) * 100)} tone="critical" />
                                            <Button variant="primary" url="https://www.droutfit.com/dashboard/billing" target="_blank">
                                                Buy More Credits
                                            </Button>
                                        </BlockStack>
                                    </div>
                                )}
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                    {/* Recent API Usage Card */}
                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">
                                    Recent Try-Ons
                                </Text>

                                {recentLogs.length === 0 ? (
                                    <div style={{ padding: '2rem 0' }}>
                                        <EmptyState
                                            heading="No try-ons yet"
                                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                                        >
                                            <p>Once customers start using the DrOutfit button on your store, their image generations will appear here.</p>
                                        </EmptyState>
                                    </div>
                                ) : (
                                    <ResourceList
                                        items={recentLogs}
                                        renderItem={(item) => {
                                            const { id, created_at, status } = item;
                                            const date = new Date(created_at).toLocaleDateString();
                                            return (
                                                <ResourceItem
                                                    id={id}
                                                    url="#"
                                                >
                                                    <InlineStack align="space-between">
                                                        <BlockStack gap="100">
                                                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                                Generation #{id.substring(0, 8)}
                                                            </Text>
                                                            <Text variant="bodySm" tone="subdued">
                                                                {date}
                                                            </Text>
                                                        </BlockStack>
                                                        <Badge tone="success">Success</Badge>
                                                    </InlineStack>
                                                </ResourceItem>
                                            );
                                        }}
                                    />
                                )}
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                </Layout>
            </BlockStack>
        </Page>
    );
}
