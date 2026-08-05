const API_VERSION = "2024-10";

function normalizeShopDomain(input: string): string {
  const trimmed = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return trimmed.endsWith(".myshopify.com") ? trimmed : `${trimmed}.myshopify.com`;
}

/** Verifies a shop domain + Admin API access token by calling Shopify's shop.json endpoint. */
export async function verifyShopifyCredentials(
  shopDomainInput: string,
  accessToken: string
): Promise<{ shopDomain: string; shopName: string }> {
  const shopDomain = normalizeShopDomain(shopDomainInput);

  const res = await fetch(`https://${shopDomain}/admin/api/${API_VERSION}/shop.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
  });

  if (!res.ok) {
    throw new Error(`SHOPIFY_VERIFY_FAILED:${res.status}`);
  }

  const json = await res.json();
  const shopName: string | undefined = json?.shop?.name;
  if (!shopName) throw new Error("SHOPIFY_VERIFY_FAILED:no_shop_in_response");

  return { shopDomain, shopName };
}

export interface ShopifyProduct {
  id: string;
  title: string;
  imageUrl: string | null;
}

/** Lists up to 20 products from a connected Shopify store, for use as UGC studio source images. */
export async function listShopifyProducts(
  shopDomain: string,
  accessToken: string
): Promise<ShopifyProduct[]> {
  const res = await fetch(
    `https://${shopDomain}/admin/api/${API_VERSION}/products.json?limit=20&fields=id,title,images`,
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );

  if (!res.ok) {
    throw new Error(`SHOPIFY_PRODUCTS_FAILED:${res.status}`);
  }

  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: any[] = json?.products ?? [];

  return products.map((p) => ({
    id: String(p.id),
    title: p.title,
    imageUrl: p.images?.[0]?.src ?? null,
  }));
}
