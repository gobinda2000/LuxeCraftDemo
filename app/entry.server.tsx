import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';
import {handleRequest as handleRenderRequest} from '@vercel/react-router/entry.server';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  responseHeaders.set('Content-Security-Policy', header);

  return handleRenderRequest(
    request,
    responseStatusCode,
    responseHeaders,
    reactRouterContext,
    undefined,
    {
      nonce,
      onError: console.error,
      // The local MiniOxygen renderer consumes this extra option. Vercel
      // ignores unknown options while using the same server entry.
      NonceProvider,
    } as Parameters<typeof handleRenderRequest>[5] & {
      NonceProvider: typeof NonceProvider;
    },
  );
}