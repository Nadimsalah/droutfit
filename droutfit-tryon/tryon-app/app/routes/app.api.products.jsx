import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    const url = new URL(request.url);
    const queryParam = url.searchParams.get("query") || "";

    try {
        const response = await admin.graphql(
            `#graphql
      query getProducts($query: String) {
        products(first: 50, query: $query) {
          edges {
            node {
              id
              title
              featuredImage {
                url
              }
              isEnabled: metafield(namespace: "droutfit", key: "is_enabled") {
                value
              }
            }
          }
        }
      }`,
            {
                variables: {
                    query: queryParam,
                },
            }
        );

        const data = await response.json();
        return json(data.data.products.edges.map(edge => edge.node));
    } catch (err) {
        console.error("Failed to fetch products:", err);
        return json({ error: "Failed to fetch products" }, { status: 500 });
    }
};

export const action = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const productId = formData.get("productId");
    const isEnabled = formData.get("isEnabled") === "true";

    try {
        const response = await admin.graphql(
            `#graphql
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            metafield(namespace: "droutfit", key: "is_enabled") {
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
            {
                variables: {
                    input: {
                        id: productId,
                        metafields: [
                            {
                                namespace: "droutfit",
                                key: "is_enabled",
                                type: "boolean",
                                value: String(isEnabled)
                            }
                        ]
                    }
                }
            }
        );

        const data = await response.json();
        return json(data);
    } catch (err) {
        console.error("Failed to update product:", err);
        return json({ error: "Failed to update product" }, { status: 500 });
    }
};
