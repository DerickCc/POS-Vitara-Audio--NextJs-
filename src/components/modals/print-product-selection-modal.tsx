import { SalesOrderProductDetailModel } from '@/models/sales-order-product-detail';
import { Dispatch, SetStateAction } from 'react';
import { Button, Checkbox, Modal } from 'rizzui';

interface PrintProductSelectionModalProps {
  isOpen: boolean;
  includedProducts: string[];
  setIncludedProducts: Dispatch<SetStateAction<string[]>>;
  productDetails: SalesOrderProductDetailModel[];
  onClose: () => void;
}

export default function PrintProductSelectionModal({
  isOpen,
  includedProducts,
  setIncludedProducts,
  productDetails,
  onClose,
}: PrintProductSelectionModalProps) {
  const handleProductSelection = (productId: string) => {
    setIncludedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  if (!isOpen) return null;

  return (
    <Modal size='lg' isOpen={isOpen} onClose={onClose}>
      <div className='m-auto p-7'>
        <h4 className='mb-2'>Pilih Barang</h4>
        <p className='mb-8' style={{ fontSize: 13 }}>
          Centang barang yang ingin ditampilkan pada bon
        </p>

        <table className='w-full border border-gray-300 mb-4'>
          <thead>
            <tr className='bg-gray-100 border-b'>
              <th className='border p-2 text-left'></th>
              <th className='border p-2 text-left'>Nama Barang / Jasa</th>
              <th className='border p-2 text-left'>Tipe</th>
            </tr>
          </thead>
          <tbody>
            {productDetails.map((item, index) => (
              <tr key={index} className='border-b'>
                <td className='border p-2 flex justify-center items-center'>
                  <Checkbox
                    checked={includedProducts.includes(item.productId)}
                    onChange={() => handleProductSelection(item.productId)}
                  />
                </td>
                <td className='border p-2'>{item.productName}</td>
                <td className='border p-2'>{item.type}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='flex items-center justify-end mt-8'>
          <Button style={{ width: 75 }} onClick={onClose}>
            Oke
          </Button>
        </div>
      </div>
    </Modal>
  );
}
