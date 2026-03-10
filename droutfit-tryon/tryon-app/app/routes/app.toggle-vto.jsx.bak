import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    const { session, admin } = await authenticate.admin(request);
    const url = new URL(request.url);
    const productId = url.searchParams.get("id");

    if (!productId) {
        return redirect("/app");
    }

    // Use GraphQL to check and toggle the 'no-try-on' tag
    try {
        // 1. Get current tags
        const response = await admin.graphql(
            `#graphql
      query getProductTags($id: ID!) {
        product(id: $id) {
          id
          tags
        }
      }`,
            {
                variables: { id: productId },
            }
        );

        const { data } = await response.json();
        const currentTags = data.product.tags;

        // 2. Determine new tags
        let newTags = [];
        if (currentTags.includes("no-try-on")) {
            newTags = currentTags.filter((t) => t !== "no-try-on");
        } else {
            newTags = [...currentTags, "no-try-on"];
        }

        // 3. Update product
        await admin.graphql(
            `#graphql
      mutation updateProductTags($id: ID!, $tags: [String!]) {
        productUpdate(input: { id: $id, tags: $tags }) {
          product {
            id
            tags
          }
          userErrors {
            field
            message
          }
        }
      }`,
            {
                variables: {
                    id: productId,
                    tags: newTags,
                },
            }
        );

        // Redirect back to the product page in Shopify Admin
        // The format for product info is "gid://shopify/Product/123456789"
        const rawId = productId.split("/").pop();
        return redirect(`https://${session.shop}/admin/products/${rawId}`);
    } catch (error) {
        console.error("Error toggling VTO tag:", error);
        return redirect("/app");
    }
};
