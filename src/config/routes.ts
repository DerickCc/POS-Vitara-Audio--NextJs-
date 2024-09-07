export const routes = {
  dashboard: '/',
  master: {
    supplier: {
      data: '/master/supplier',
      add: '/master/supplier/add',
      edit: (id: string) => `/master/supplier/${id}/edit`,
    },
    customer: {
      data: '/master/customer',
      add: '/master/customer/add',
      edit: (id: string) => `/master/customer/${id}/edit`,
    },
  },
  inventory: {
    product: {
      data: '/inventory/product',
      add: '/inventory/product/add',
      edit: (id: string) => `/inventory/product/${id}/edit`,
    },
    purchaseReturn: '/inventory/purchase-return',
    salesReturn: '/inventory/sales-return',
  },
  transaction: {
    purchaseOrder: '/transaction/purchase-order',
    salesOrder: '/transaction/sales-order',
  },
  settings: {
    user: '/settings/user',
  },
};
