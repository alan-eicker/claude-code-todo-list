// Declares the shape of CSS Module imports so TypeScript understands that
// importing a *.module.css file yields a plain object of class-name strings.
declare module '*.module.css' {
  const styles: { readonly [key: string]: string };
  export default styles;
}
