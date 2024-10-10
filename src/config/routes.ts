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
    purchaseReturn: {
      data: '/inventory/purchase-return',
      add: '/inventory/purchase-return/add',
      edit: (id: string) => `/inventory/purchase-return/${id}/edit`
    },
    salesReturn: {
      data: '/inventory/sales-return',
      add: '/inventory/sales-return/add',
      edit: (id: string) => `/inventory/sales-return/${id}/edit`
    },
  },
  transaction: {
    purchaseOrder: {
      data: '/transaction/purchase-order',
      add: '/transaction/purchase-order/add',
      view: (id: string) => `/transaction/purchase-order/${id}/view`,
      edit: (id: string) => `/transaction/purchase-order/${id}/edit`
    },
    salesOrder: {
      data: '/transaction/sales-order',
      add: '/transaction/sales-order/add',
      view: (id: string) => `/transaction/sales-order/${id}/view`,
      edit: (id: string) => `/transaction/sales-order/${id}/edit`
    },
  },
  settings: {
    user: {
      data: '/settings/user',
      add: '/settings/user/add',
      edit: (id: string) => `/settings/user/${id}/edit`
    }
  },
};
