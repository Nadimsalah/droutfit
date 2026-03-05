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
            {!profile ? (
              <Card>
                <BlockStack gap="500">
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingMd">
                      👋 Connect with DrOutfit
                    </Text>
                    <Text variant="bodyMd" as="p">
                      To start using AI Try-On and manage your credits, you need to connect your DrOutfit account to this Shopify store.
                    </Text>
                  </BlockStack>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" fontWeight="bold">
                      Why connect?
                    </Text>
                    <List>
                      <List.Item>Use your existing DrOutfit credits</List.Item>
                      <List.Item>Sync your product catalog</List.Item>
                      <List.Item>Access advanced AI models</List.Item>
                    </List>
                  </BlockStack>
                  <InlineStack gap="300">
                    <Button
                      url="/app/connect"
                      variant="primary"
                    >
                      Connect DrOutfit Account
                    </Button>
                    <Button
                      url="https://www.droutfit.com/signup"
                      external
                    >
                      Create Account
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            ) : (
              <Card>
                <BlockStack gap="500">
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingMd">
                      🎉 Welcome back, {profile.full_name || 'Merchant'}!
                    </Text>
                    <Text variant="bodyMd" as="p">
                      Your DrOutfit account is connected. You have <b>{profile.credits}</b> credits remaining.
                    </Text>
                  </BlockStack>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      Quick Start
                    </Text>
                    <List>
                      <List.Item>
                        Go to the <b>Theme Customizer</b> on your store.
                      </List.Item>
                      <List.Item>
                        Navigate to the <b>Default Product</b> template.
                      </List.Item>
                      <List.Item>
                        Click <b>Add Block</b> and drag the <b>Virtual Try-On Button</b>.
                      </List.Item>
                    </List>
                  </BlockStack>
                  <InlineStack gap="300">
                    <Button
                      url="/app/dashboard"
                      variant="primary"
                    >
                      Open Analytics Dashboard
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
