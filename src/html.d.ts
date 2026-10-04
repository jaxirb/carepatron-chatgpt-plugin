// Wrangler bundles .html files as text modules (default rule); see wrangler.jsonc.
declare module "*.html" {
  const content: string;
  export default content;
}
