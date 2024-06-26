/** @type {import("prettier").Config} */
const config = {
  // printWith: 120,
  singleQuote: true,
  // semi:false,
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  plugins: ['prettier-plugin-tailwindcss'],
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
};
export default config;
