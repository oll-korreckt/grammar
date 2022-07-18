declare module "*.scss" {
    const classes: { readonly [key: string]: string; };
    export default classes;
}
declare module "*.png";

declare namespace NodeJS {
    interface ProcessEnv {
        readonly NEXT_PUBLIC_URL: string;
    }
}