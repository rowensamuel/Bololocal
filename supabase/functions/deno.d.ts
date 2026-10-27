// Type definitions for Supabase Deno Edge Functions in TypeScript IDEs

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  };
}

declare module 'https://*' {
  export const serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  export const createClient: any;
  const content: any;
  export default content;
}
