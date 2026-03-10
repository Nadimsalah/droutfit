import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { supabase } from "../supabase";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // Auto-create Metafield Definition for Droutfit Try On
  try {
    const response = await admin.graphql(
      `#graphql
      mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          definition: {
            name: "Droutfit Try On",
            namespace: "droutfit",
            key: "is_enabled",
            description: "Turn the Virtual Try-On button On or Off.",
            type: "boolean",
            ownerType: "PRODUCT"
          }
        }
      }
    );
    const data = await response.json();
    if (data.data?.metafieldDefinitionCreate?.userErrors?.length) {
      // It's perfectly normal if it already exists (has been taken error)
      console.log("Metafield validation (likely exists):", data.data.metafieldDefinitionCreate.userErrors);
    }
  } catch (err) {
    console.error("Failed to create metafield definition automatically:", err);
  }

  // Fetch the profile for this merchant
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('store_website', shop)
    .single();

  // If no profile exists for this shop, create a placeholder merchant profile with free credits
  if (!profile) {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([
        {
          store_website: shop,
          credits: 100, // 100 free try-on credits for new merchants
          full_name: `Shopify Merchant (${shop})`,
          ip_limit: 5 // Standard daily limit per IP for the widget
        }
      ])
      .select()
      .single();

    if (!createError) {
      profile = newProfile;
    } else {
      console.error("Failed to create shopify profile:", createError);
    }
  }

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop,
    profile
  };
};

export default function App() {
  const { apiKey, profile, shop } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        {!profile && <Link to="/app/connect">Connect Account</Link>}
        {profile && <Link to="/app/dashboard">DrOutfit Dashboard</Link>}
      </NavMenu>
      <Outlet context={{ profile, shop }} />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
