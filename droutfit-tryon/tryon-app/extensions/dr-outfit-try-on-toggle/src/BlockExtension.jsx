import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import "@shopify/ui-extensions/preact";

export default async () => {
  render(<Extension />, document.body);
}

function Extension() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const productId = shopify.data.product.id;

  async function fetchTags() {
    try {
      const response = await shopify.query(
        `query getProduct($id: ID!) {
          product(id: $id) {
            tags
          }
        }`,
        { variables: { id: productId } }
      );
      setTags(response.data.product.tags);
    } catch (e) {
      console.error("Failed to fetch tags:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTags();
  }, []);

  const isEnabled = !tags.includes('no-try-on');

  async function handleToggle(newValue) {
    setUpdating(true);
    // newValue is true if the switch is ON (Enabled), false if OFF (Disabled)
    // If it's ON (true), we REMOVE the 'no-try-on' tag.
    // If it's OFF (false), we ADD the 'no-try-on' tag.
    const newTags = newValue
      ? tags.filter(t => t !== 'no-try-on')
      : [...tags, 'no-try-on'];

    try {
      await shopify.query(
        `mutation updateProduct($id: ID!, $tags: [String!]) {
          productUpdate(input: { id: $id, tags: $tags }) {
            product { id tags }
          }
        }`,
        { variables: { id: productId, tags: newTags } }
      );
      setTags(newTags);
    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <s-admin-block><s-text>Connecting to DrOutfit...</s-text></s-admin-block>;

  return (
    <s-admin-block heading="DrOutfit Try On Settings">
      <s-box padding="400">
        <s-inline-stack align="space-between" vertical-align="center">
          <s-stack direction="block" gap="100">
            <s-text type="strong" size="large">Show Try-On Button</s-text>
            <s-text tone="subdued">
              Toggle this switch to instantly hide or show the Virtual Try-On button on this product.
            </s-text>
          </s-stack>

          <s-switch
            checked={isEnabled}
            on-change={handleToggle}
            disabled={updating}
          />
        </s-inline-stack>
      </s-box>
    </s-admin-block>
  );
}