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

  async function toggleVTO() {
    setUpdating(true);
    const newTags = isEnabled
      ? [...tags, 'no-try-on']
      : tags.filter(t => t !== 'no-try-on');

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

  if (loading) return <s-admin-block><s-text>Loading...</s-text></s-admin-block>;

  return (
    <s-admin-block heading="DrOutfit Try On Control">
      <s-box padding="400">
        <s-stack direction="block" gap="400">
          <s-inline-stack align="space-between" vertical-align="center">
            <s-stack direction="block" gap="100">
              <s-text type="strong">Status:</s-text>
              <s-text tone={isEnabled ? "success" : "critical"}>
                {isEnabled ? "✨ ENABLED (Button Visible)" : "❌ DISABLED (Hidden)"}
              </s-text>
            </s-stack>

            <s-button
              on-press={toggleVTO}
              loading={updating}
              primary={!isEnabled}
              tone={isEnabled ? "critical" : "default"}
            >
              {isEnabled ? "Disable Try-On" : "Enable Try-On"}
            </s-button>
          </s-inline-stack>

          <s-text tone="subdued" size="small">
            Use this toggle to hide/show the DrOutfit button on your website for this specific product.
          </s-text>
        </s-stack>
      </s-box>
    </s-admin-block>
  );
}