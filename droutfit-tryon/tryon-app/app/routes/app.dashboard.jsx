import { useEffect, useState, useCallback } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
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
    EmptyState,
    Modal,
    TextField,
    Box,
    Checkbox,
    Spinner
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { supabase } from "../supabase";
import { SearchIcon } from "@shopify/polaris-icons";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;

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

    const { data: logs } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

    if (logs) recentLogs = logs;

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
    const shopify = useAppBridge();
    const fetcher = useFetcher();

    // Modal & Product Management State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const credits = profile?.credits || 0;

    // Load products when modal opens
    useEffect(() => {
        if (isProductModalOpen) {
            fetchProducts();
        }
    }, [isProductModalOpen]);

    const fetchProducts = async (query = "") => {
        setIsLoadingProducts(true);
        try {
            const res = await fetch(`/app/api/products?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching products:", err);
            setProducts([]);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value);
        fetchProducts(value);
    }, []);

    const toggleProductStatus = async (productId, currentStatus) => {
        const newStatus = !currentStatus;

        // Optimistic update
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, isEnabled: { value: String(newStatus) } } : p));

        const formData = new FormData();
        formData.append("productId", productId);
        formData.append("isEnabled", String(newStatus));

        fetcher.submit(formData, { method: "POST", action: "/app/api/products" });
    };

    useEffect(() => {
        if (fetcher.data && fetcher.state === "idle" && !fetcher.data.error) {
            shopify.toast.show("Try-On status updated successfully");
        }
    }, [fetcher.state, fetcher.data]);

    return (
        <Page fullWidth>
            <TitleBar title="DrOutfit Dashboard" />

            <BlockStack gap="500">
                <Layout>
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

                                <Box borderBlockStartWidth="025" borderBlockStartColor="border-subdued" paddingTop="400">
                                    <BlockStack gap="300">
                                        <Text variant="headingSm" as="h3">Product Management</Text>
                                        <Text tone="subdued">Control which products display the Virtual Try-On button on your storefront.</Text>
                                        <InlineStack gap="300">
                                            <Button variant="primary" onClick={() => setIsProductModalOpen(true)}>
                                                Manage Try-On Products
                                            </Button>
                                            {credits < 50 && (
                                                <Button url="https://www.droutfit.com/dashboard/billing" target="_blank" tone="critical">
                                                    Top up Credits
                                                </Button>
                                            )}
                                        </InlineStack>
                                    </BlockStack>
                                </Box>

                                {credits < 50 && (
                                    <div style={{ marginTop: '16px' }}>
                                        <BlockStack gap="200">
                                            <InlineStack align="space-between">
                                                <Text variant="bodySm">Credit Usage Warning</Text>
                                                <Text variant="bodySm">{credits} remaining</Text>
                                            </InlineStack>
                                            <ProgressBar progress={Math.max(5, (credits / 100) * 100)} tone="critical" />
                                        </BlockStack>
                                    </div>
                                )}
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">
                                    Recent Activity
                                </Text>

                                {recentLogs.length === 0 ? (
                                    <div style={{ padding: '2rem 0' }}>
                                        <EmptyState
                                            heading="No activity yet"
                                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                                        >
                                            <p>Once customers start using the DrOutfit button, their generations will appear here.</p>
                                        </EmptyState>
                                    </div>
                                ) : (
                                    <ResourceList
                                        items={recentLogs}
                                        renderItem={(item) => {
                                            const { id, created_at } = item;
                                            const date = new Date(created_at).toLocaleDateString();
                                            return (
                                                <ResourceItem id={id} url="#">
                                                    <InlineStack align="space-between">
                                                        <BlockStack gap="100">
                                                            <Text variant="bodyMd" fontWeight="bold">Generation #{id.substring(0, 8)}</Text>
                                                            <Text variant="bodySm" tone="subdued">{date}</Text>
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

            {/* Manage Products Modal */}
            <Modal
                open={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                title="Select Products for Try-On"
                primaryAction={{
                    content: 'Done',
                    onAction: () => setIsProductModalOpen(false),
                }}
            >
                <Modal.Section>
                    <BlockStack gap="400">
                        <TextField
                            label="Search Products"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            prefix={<Icon source={SearchIcon} />}
                            autoComplete="off"
                            placeholder="Filter by title..."
                        />

                        {isLoadingProducts ? (
                            <Box padding="800" textAlign="center">
                                <Spinner size="large" />
                                <Text tone="subdued">Fetching your products...</Text>
                            </Box>
                        ) : (
                            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                <ResourceList
                                    resourceName={{ singular: 'product', plural: 'products' }}
                                    items={products}
                                    renderItem={(product) => {
                                        const { id, title, featuredImage, isEnabled } = product;
                                        const media = featuredImage ? (
                                            <Thumbnail source={featuredImage.url} alt={title} size="small" />
                                        ) : (
                                            <Thumbnail source="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png" alt={title} size="small" />
                                        );

                                        // Default to enabled if metafield is missing (blank)
                                        const enabled = isEnabled === null || isEnabled?.value === "true";

                                        return (
                                            <ResourceItem id={id} media={media} verticalAlignment="center" onClick={() => { }}>
                                                <InlineStack align="space-between" verticalAlign="center">
                                                    <BlockStack gap="100">
                                                        <Text variant="bodyMd" fontWeight="bold">{title}</Text>
                                                        <Text variant="bodySm" tone="subdued">ID: {id.split('/').pop()}</Text>
                                                    </BlockStack>
                                                    <Checkbox
                                                        label={enabled ? "Enabled" : "Disabled"}
                                                        checked={enabled}
                                                        onChange={() => toggleProductStatus(id, enabled)}
                                                    />
                                                </InlineStack>
                                            </ResourceItem>
                                        );
                                    }}
                                />
                            </div>
                        )}
                    </BlockStack>
                </Modal.Section>
            </Modal>
        </Page>
    );
}
