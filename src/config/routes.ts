export const routes = {
  dashboard: '/',
  master: {
    supplier: '/master/supplier',
    customer: '/master/customer',
  },
  inventory: {
    product: '/inventory/product',
    purchaseReturn: '/inventory/purchase-return',
    salesReturn: '/inventory/sales-return',
  },
  transaction: {
    purchaseOrder: '/transaction/purchase-order',
    salesOrder: '/transaction/sales-order',
  },
  settings: {
    user: '/settings/user',
  }
};
