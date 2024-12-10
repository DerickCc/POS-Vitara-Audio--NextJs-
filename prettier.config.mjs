/** @type {import("prettier").Config} */
const config = {
  printWidth: 80,
  singleQuote: true,
  semi: true,
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  plugins: ['prettier-plugin-tailwindcss'],
  '[prisma]': {
    'editor.defaultFormatter': 'Prisma.prisma',
  },
};
export default config;
