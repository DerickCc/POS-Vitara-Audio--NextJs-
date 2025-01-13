import { SearchProductModel } from '@/models/product.model';

export default function ProductOptionTemplate({ option }: { option: SearchProductModel }) {
  return (
    <div className='p-1 flex items-center gap-4'>
      <div className='flex flex-col'>
        <span className='font-semibold text-gray-800'>{option.name}</span>
        <span className='text-sm text-gray-600'>
          {option.stock} {option.uom} ({option.purchasePriceCode})
        </span>
      </div>
    </div>
  );
}
