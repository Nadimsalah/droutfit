import { useEffect } from "react";
import { useFetcher, useOutletContext } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Icon,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const shopify = useAppBridge();
  const { profile } = useOutletContext();

  return (
    <Page>
      <TitleBar title="DrOutfit Virtual Try-On">
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            {!profile || !profile.email ? (
              <Card>
                <BlockStack gap="500">
                  <Box padding="200" background="bg-surface-info-subdued" borderRadius="200">
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingMd">
                        🚀 Get Started: Connect DrOutfit
                      </Text>
                      <Text variant="bodyMd" as="p">
                        To enable AI Try-On on your store, you need to link this shop to a DrOutfit account. This allows you to share credits and sync settings.
                      </Text>
                    </BlockStack>
                  </Box>

                  <BlockStack gap="400">
                    <Text as="h3" variant="headingSm" fontWeight="bold">
                      Connection Status: <span style={{ color: 'orange' }}>Action Required</span>
                    </Text>
                    <List>
                      <List.Item><b>Sync Credits:</b> Use your main account balance here.</List.Item>
                      <List.Item><b>IP Protection:</b> Prevent bot abuse on your storefront.</List.Item>
                      <List.Item><b>HD Models:</b> Access our latest 2.5-Preview AI engine.</List.Item>
                    </List>
                  </BlockStack>

                  <InlineStack gap="300">
                    <Button
                      url="/app/connect"
                      variant="primary"
                      size="large"
                    >
                      Connect Existing Account
                    </Button>
                    <Button
                      url="https://www.droutfit.com/signup"
                      external
                    >
                      Create New Account
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            ) : (
              <Card>
                <BlockStack gap="500">
                  <InlineStack align="space-between">
                    <BlockStack gap="100">
                      <Text as="h2" variant="headingLg">
                        ✅ System Connected
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued">
                        Connected to: <b>{profile.email}</b>
                      </Text>
                    </BlockStack>
                    <Box padding="200" background="bg-surface-success-subdued" borderRadius="200">
                      <Text variant="headingMd" as="span" tone="success">
                        {profile.credits} Credits Remaining
                      </Text>
                    </Box>
                  </InlineStack>

                  <Box borderBlockStartWidth="025" borderBlockStartColor="border-subdued" paddingTop="400">
                    <BlockStack gap="400">
                      <Text as="h3" variant="headingMd">
                        Installation Guide
                      </Text>
                      <Box padding="400" background="bg-surface-secondary" borderRadius="300">
                        <BlockStack gap="300">
                          <InlineStack gap="300" align="start">
                            <Box width="24px" height="24px" background="bg-fill-info" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                              <Text variant="bodySm" fontWeight="bold" tone="on-surface-info">1</Text>
                            </Box>
                            <Text variant="bodyMd">Click <b>Online Store</b> &gt; <b>Themes</b> &gt; <b>Customize</b></Text>
                          </InlineStack>
                          <InlineStack gap="300" align="start">
                            <Box width="24px" height="24px" background="bg-fill-info" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                              <Text variant="bodySm" fontWeight="bold" tone="on-surface-info">2</Text>
                            </Box>
                            <Text variant="bodyMd">Select the <b>Default Product</b> page template</Text>
                          </InlineStack>
                          <InlineStack gap="300" align="start">
                            <Box width="24px" height="24px" background="bg-fill-info" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                              <Text variant="bodySm" fontWeight="bold" tone="on-surface-info">3</Text>
                            </Box>
                            <Text variant="bodyMd">Click <b>Add Block</b> and choose <b>Virtual Try-On Button</b></Text>
                          </InlineStack>
                        </BlockStack>
                      </Box>
                    </BlockStack>
                  </Box>

                  <InlineStack gap="300">
                    <Button
                      url="/app/dashboard"
                      variant="secondary"
                    >
                      View Detailed Analytics
                    </Button>
                    <Button
                      url="/app/connect"
                      variant="tertiary"
                    >
                      Switch Account
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
