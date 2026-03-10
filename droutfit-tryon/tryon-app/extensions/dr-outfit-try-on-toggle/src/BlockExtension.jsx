import {
  extension,
  AdminBlock,
  BlockStack,
  Box,
  Text,
  Switch,
  InlineStack,
  Divider,
} from "@shopify/ui-extensions/admin";

export default extension("admin.product-details.block.render", (root, { data, query }) => {
  let tags = [];
  let loading = true;
  let updating = false;
  const productId = data.selected[0].id;

  async function fetchTags() {
    try {
      const result = await query(
        `query getProduct($id: ID!) {
          product(id: $id) {
            tags
          }
        }`,
        { variables: { id: productId } }
      );
      tags = result.data.product.tags;
      loading = false;
      render();
    } catch (e) {
      console.error("Failed to fetch tags:", e);
    }
  }

  async function handleToggle(newValue) {
    if (updating) return;
    updating = true;
    render();

    const isCurrentlyEnabled = !tags.includes("no-try-on");
    const newTags = isCurrentlyEnabled
      ? [...tags, "no-try-on"]
      : tags.filter((t) => t !== "no-try-on");

    try {
      await query(
        `mutation updateProduct($id: ID!, $tags: [String!]) {
          productUpdate(input: { id: $id, tags: $tags }) {
            product { id tags }
          }
        }`,
        { variables: { id: productId, tags: newTags } }
      );
      tags = newTags;
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
        { title: "DrOutfit Try On Control" },
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
                root.createComponent(Text, { fontWeight: "bold" }, "Show Try-On Button"),
                root.createComponent(
                  Text,
                  { tone: "subdued", size: "small" },
                  "Toggle to hide/show the button on your store."
                )
              ),
              root.createComponent(Switch, {
                checked: !tags.includes("no-try-on"),
                onChange: handleToggle,
                disabled: loading || updating,
              })
            )
          )
        )
      )
    );
  }

  fetchTags();
  render(); // Initial render with loading state
});