export const CURRENCY_CODE = 'IDR';
export const LOCALE = 'id';
export const CURRENCY_OPTIONS = {
  formation: 'id-ID',
  fractions: 2,
};

export const ROW_PER_PAGE_OPTIONS = [
  {
    value: 5,
    label: '5',
  },
  {
    value: 10,
    label: '10',
  },
  {
    value: 15,
    label: '15',
  },
  {
    value: 25,
    label: '25',
  },
  {
    value: 50,
    label: '50',
  },
];

export const tableClass = `
  min-w-full border-collapse [&_thead]:bg-primary-lighter/10 [&_th]:text-start [&_th]:text-gray-900 [&_th]:tracking-wider [&_th]:uppercase [&_th]:font-semibold 
  [&_th]:text-xs [&_th]:p-3 [&_tbody_tr]:border-b [&_tbody_tr]:border-muted/70 hover:[&_tbody_tr]:bg-gray-200/40 [&_td]:py-4 [&_td]:px-3 
  before:[&_.sticky-left]:pointer-events-none before:[&_.sticky-left]:absolute before:[&_.sticky-left]:bottom-0 before:[&_.sticky-left]:end-0 
  before:[&_.sticky-left]:top-0 before:[&_.sticky-left]:hidden before:[&_.sticky-left]:w-5 before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.2)] 
  first:before:[&_.sticky-left]:block dark:before:[&_.sticky-left]:shadow-[inset_10px_0_8px_-8px_rgba(130,136,155,0.1)] before:[&_.sticky-left]:transition-shadow 
  before:[&_.sticky-left]:duration-300 before:[&_.sticky-left]:translate-x-full before:[&_.sticky-right]:content-[""] after:[&_.sticky-right]:pointer-events-none 
  after:[&_.sticky-right]:absolute after:[&_.sticky-right]:-bottom-[1px] after:[&_.sticky-right]:start-0 after:[&_.sticky-right]:top-0 after:[&_.sticky-right]:hidden 
  after:[&_.sticky-right]:w-5 after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.2)] last:after:[&_.sticky-right]:block 
  dark:after:[&_.sticky-right]:shadow-[inset_-10px_0_8px_-8px_rgba(130,136,155,0.1)] after:[&_.sticky-right]:transition-shadow 
  after:[&_.sticky-right]:duration-300 after:[&_.sticky-right]:-translate-x-full after:[&_.sticky-right]:content-[""] [&_th.sticky-left]:bg-gray-100 
  [&_td.sticky-left]:bg-white dark:[&_td.sticky-left]:bg-gray-50 [&_th.sticky-right]:bg-gray-100 [&_td.sticky-right]:bg-white dark:[&_td.sticky-right]:bg-gray-50
`;
