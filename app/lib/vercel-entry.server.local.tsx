import {renderToReadableStream} from 'react-dom/server.browser';
import {ServerRouter, type AppLoadContext, type EntryContext} from 'react-router';
import type {ComponentType, ReactNode} from 'react';
import type {RenderToReadableStreamOptions} from 'react-dom/server';

/**
 * MiniOxygen-compatible development replacement for
 * `@vercel/react-router/entry.server`. Vercel uses its Node streaming helper
 * in production; the Worker emulator uses Web Streams instead.
 */
export async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext?: AppLoadContext,
  options?: RenderToReadableStreamOptions & {
    NonceProvider?: ComponentType<{children: ReactNode}>;
  },
): Promise<Response> {
  const {NonceProvider, ...renderOptions} = options ?? {};
  const router = (
    <ServerRouter
      context={routerContext}
      url={request.url}
      nonce={options?.nonce}
    />
  );

  const body = await renderToReadableStream(
    options?.NonceProvider ? (
      <options.NonceProvider>{router}</options.NonceProvider>
    ) : (
      router
    ),
    {
      ...renderOptions,
      signal: request.signal,
      onError(error) {
        console.error(error);
        renderOptions.onError?.(error);
        responseStatusCode = 500;
      },
    },
  );

  if (routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}