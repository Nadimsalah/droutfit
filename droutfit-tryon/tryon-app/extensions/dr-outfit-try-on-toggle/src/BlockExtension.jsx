import {
  extension,
  AdminBlock,
  BlockStack,
  Box,
  Text,
  Switch,
  InlineStack,
} from "@shopify/ui-extensions/admin";

export default extension("admin.product-details.block.render", (root, { data, query }) => {
  let isEnabled = true; // Default to true
  let loading = true;
  let updating = false;
  const productId = data.selected[0].id;

  async function fetchData() {
    try {
      const result = await query(
        `query getProduct($id: ID!) {
          product(id: $id) {
            metafield(namespace: "droutfit", key: "is_enabled") {
              value
            }
          }
        }`,
        { variables: { id: productId } }
      );

      const metafieldValue = result.data.product?.metafield?.value;
      // Metafield value comes as a string "true" or "false"
      isEnabled = metafieldValue === null || metafieldValue === "true";
      loading = false;
      render();
    } catch (e) {
      console.error("Failed to fetch metafield:", e);
    }
  }

  async function handleToggle(newValue) {
    if (updating) return;
    updating = true;
    render();

    try {
      const result = await query(
        `mutation setMetafield($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              value
            }
            userErrors {
              message
            }
          }
        }`,
        {
          variables: {
            metafields: [
              {
                ownerId: productId,
                namespace: "droutfit",
                key: "is_enabled",
                type: "boolean",
                value: String(newValue)
              }
            ]
          }
        }
      );

      if (result.data.metafieldsSet.userErrors.length > 0) {
        console.error("Mutation errors:", result.data.metafieldsSet.userErrors);
      } else {
        isEnabled = newValue;
      }
    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      updating = false;
      render();
    }
  }

  function render() {
    root.replaceChildren(
      root.createComponent(
        AdminBlock,
        { title: "DrOutfit Try-On" },
        root.createComponent(
          BlockStack,
          { gap: true },
          root.createComponent(
            Box,
            { padding: "base" },
            root.createComponent(
              InlineStack,
              { align: "space-between", blockAlign: "center" },
              root.createComponent(
                BlockStack,
                { gap: "none" },
                root.createComponent(Text, { fontWeight: "bold" }, "Enable Virtual Try-On"),
                root.createComponent(
                  Text,
                  { tone: "subdued", size: "small" },
                  "Show the try-on button for this product."
                )
              ),
              root.createComponent(Switch, {
                checked: isEnabled,
                onChange: handleToggle,
                disabled: loading || updating,
              })
            )
          )
        )
      )
    );
  }

  fetchData();
  render();
});
