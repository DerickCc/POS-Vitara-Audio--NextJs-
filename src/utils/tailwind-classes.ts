export const tableClass = `
  min-w-full border-collapse [&_thead]:bg-primary-lighter/10 [&_th]:text-start [&_th]:text-gray-900 [&_th]:tracking-wider [&_th]:uppercase [&_th]:font-semibold 
  [&_th]:text-xs [&_th]:p-3 [&_tbody_tr]:border-b [&_tbody_tr]:border-muted/70 hover:[&_tbody_tr]:bg-gray-100/40 [&_td]:py-4 [&_td]:px-3 
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

export const datepickerClass = `
  [&.react-datepicker]:shadow-lg [&.react-datepicker]:border-gray-100 [&.react-datepicker]:rounded-md
  [&.react-datepicker>div]:pt-5 [&.react-datepicker>div]:pb-3
  [&.react-datepicker>button]:items-baseline [&.react-datepicker>button]:top-7
  [&.react-datepicker>button]:border [&.react-datepicker>button]:border-solid [&.react-datepicker>button]:border-gray-300 [&.react-datepicker>button]:rounded-md
  [&.react-datepicker>button]:h-[22px] [&.react-datepicker>button]:w-[22px]
  [&.react-datepicker>button>span]:top-0
  [&.react-datepicker>button>span]:before:border-t-[1.5px] [&.react-datepicker>button>span]:before:border-r-[1.5px] [&.react-datepicker>button>span]:before:border-gray-400
  [&.react-datepicker>button>span]:before:h-[7px] [&.react-datepicker>button>span]:before:w-[7px]
  `;

export const baseBadgeClass = 'inline-flex items-center rounded-md py-1 px-3 font-medium';

export const badgeColorClass = {
  red: 'bg-red-100 text-red-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-gray-100 text-gray-700',
};

export const actionIconColorClass = {
  red: 'text-red-500 hover:border-red-600 hover:text-red-600',
  green: 'text-green-500 hover:border-green-600 hover:text-green-600',
  yellow: 'text-yellow-500 hover:border-yellow-600 hover:text-yellow-600',
  blue: '',
  purple: 'text-purple-500 hover:border-purple-600 hover:text-purple-600',
  gray: 'text-gray-500',
};

export const baseButtonClass = 'hover:text-gray-100 disabled:bg-gray-400 disabled:text-gray-200';

export const buttonColorClass = {
  red: 'bg-red-500 hover:bg-red-700',
  green: 'bg-green-500 hover:bg-green-700',
  yellow: 'bg-yellow-500 hover:bg-yellow-600',
  purple: 'bg-purple-500 hover:bg-purple-700',
  blue: '',
  gray: 'bg-gray-500 hover:bg-gray-700',
};

export const readOnlyClass = 'bg-gray-100/70';
