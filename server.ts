import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {waitUntil} from '@vercel/functions';
import {createHydrogenRouterContext} from '~/lib/context';

/**
 * Vercel server entry. React Router bundles this module as a Vercel Function.
 */
async function respond(
  request: Request,
  env: Env,
  executionContext: {waitUntil: (promise: Promise<unknown>) => void | undefined},
): Promise<Response> {
  // On Vercel, user env vars live on process.env. The runtime may also pass an
  // env object with only Vercel-specific keys. Merging both ensures Shopify
  // vars (SESSION_SECRET, etc.) are available on Vercel while MiniOxygen's
  // env parameter still takes precedence during local development.
  const resolvedEnv = {...process.env, ...(env || {})} as unknown as Env;
  // executionContext is also undefined when Vercel calls .fetch(request) with
  // a single argument. Fall back to Vercel's waitUntil from @vercel/functions.
  const resolvedContext = executionContext || {waitUntil};
  try {
    const hydrogenContext = await createHydrogenRouterContext(
      request,
      resolvedEnv,
      resolvedContext,
    );

    /**
     * Hydrogen wraps React Router's handler to proxy Storefront API requests
     * and forward the required analytics and cart headers.
     */
    const requestHandler = createRequestHandler({
      build: serverBuild,
      mode: process.env.NODE_ENV,
      getLoadContext: () => hydrogenContext,
    });

    const response = await requestHandler(request);

    if (hydrogenContext.session.isPending) {
      response.headers.set(
        'Set-Cookie',
        await hydrogenContext.session.commit(),
      );
    }

    if (response.status === 404) {
      /**
       * Check for redirects only when there's a 404 from the app.
       * If the redirect doesn't exist, then `storefrontRedirect`
       * will pass through the 404 response.
       */
      return storefrontRedirect({
        request,
        response,
        storefront: hydrogenContext.storefront,
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return new Response('An unexpected error occurred', {status: 500});
  }
}

/** Vercel calls the default Fetch-compatible function. */
async function handleVercelRequest(request: Request): Promise<Response> {
  return respond(request, process.env as unknown as Env, {waitUntil});
}

/**
 * MiniOxygen calls `.fetch` during local development. Keeping this adapter on
 * the function lets `npm run dev` exercise the same Hydrogen request logic.
 */
async function handleOxygenRequest(
  request: Request,
  env: Env,
  executionContext: {waitUntil: (promise: Promise<unknown>) => void},
): Promise<Response> {
  return respond(request, env, executionContext);
}

export default Object.assign(handleVercelRequest, {fetch: handleOxygenRequest});