import { useState } from "react";
import { useActionData, useNavigation, Form, useOutletContext, useSubmit } from "@remix-run/react";
import {
    Page,
    Layout,
    Card,
    TextField,
    Button,
    BlockStack,
    Text,
    Banner,
    Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { supabase } from "../supabase";

export const action = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const shop = formData.get("shop");

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Link the Shopify shop to this DrOutfit profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ store_website: shop })
        .eq('id', data.user.id);

    if (updateError) {
        return { error: "Failed to link account: " + updateError.message };
    }

    return { success: true };
};

export default function Connect() {
    const { shop } = useOutletContext();
    const actionData = useActionData();
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const isLoading = navigation.state === "submitting";

    return (
        <Page backAction={{ content: 'Home', url: '/app' }}>
            <TitleBar title="Connect DrOutfit Account" />
            <Layout>
                <Layout.Section>
                    <Box paddingBlockEnd="1000">
                        <Card>
                            <Form method="post">
                                <input type="hidden" name="shop" value={shop} />
                                <BlockStack gap="500">
                                    <BlockStack gap="200">
                                        <Text as="h2" variant="headingMd">
                                            Link your DrOutfit Account
                                        </Text>
                                        <Text variant="bodyMd" as="p">
                                            Already have a DrOutfit account? Log in below to connect your store and use your shared credits.
                                        </Text>
                                    </BlockStack>

                                    {actionData?.error && (
                                        <Banner tone="critical">
                                            <p>{actionData.error}</p>
                                        </Banner>
                                    )}

                                    {actionData?.success && (
                                        <Banner tone="success" onDismiss={() => window.location.href = "/app"}>
                                            <p>Successfully connected! Redirecting to home...</p>
                                        </Banner>
                                    )}

                                    <TextField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(val) => setEmail(val)}
                                        autoComplete="email"
                                        placeholder="your@email.com"
                                    />

                                    <TextField
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={(val) => setPassword(val)}
                                        autoComplete="current-password"
                                    />

                                    <Button submit variant="primary" loading={isLoading} size="large">
                                        Connect to Shopify
                                    </Button>

                                    <Box paddingTop="400" borderBlockStartWidth="025" borderBlockStartColor="border-subdued">
                                        <BlockStack gap="200">
                                            <Text as="h3" variant="headingSm" fontWeight="bold">
                                                New to DrOutfit?
                                            </Text>
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                                                <Text variant="bodyMd" as="p">
                                                    Go to our website to create an account first, then come back here to click connect.
                                                </Text>
                                            </div>
                                            <Button
                                                url="https://www.droutfit.com/signup"
                                                external
                                                variant="secondary"
                                            >
                                                Create Account on DrOutfit.com
                                            </Button>
                                        </BlockStack>
                                    </Box>
                                </BlockStack>
                            </Form>
                        </Card>
                    </Box>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
