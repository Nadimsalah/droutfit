import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { supabase } from "../supabase";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Fetch the profile for this merchant
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('store_website', shop)
    .single();

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
