export const routes = {
  dashboard: '/',
  master: {
    supplier: {
      data: '/master/supplier',
      add: '/master/supplier/add',
      detail: (id: string) => `/master/supplier/${id}/detail`,
      edit: (id: string) => `/master/supplier/${id}/edit`,
    },
    customer: {
      data: '/master/customer',
      add: '/master/customer/add',
      detail: (id: string) => `/master/customer/${id}/detail`,
      edit: (id: string) => `/master/customer/${id}/edit`,
    },
  },
  inventory: {
    product: {
      data: '/inventory/product',
      add: '/inventory/product/add',
      detail: (id: string) => `/inventory/product/${id}/detail`,
      edit: (id: string) => `/inventory/product/${id}/edit`,
    },
    purchaseReturn: {
      data: '/inventory/purchase-return',
      add: '/inventory/purchase-return/add',
      detail: (id: string) => `/inventory/purchase-return/${id}/detail`,
      edit: (id: string) => `/inventory/purchase-return/${id}/edit`
    },
    salesReturn: {
      data: '/inventory/sales-return',
      add: '/inventory/sales-return/add',
      detail: (id: string) => `/inventory/sales-return/${id}/detail`,
      edit: (id: string) => `/inventory/sales-return/${id}/edit`
    },
  },
  transaction: {
    purchaseOrder: {
      data: '/transaction/purchase-order',
      add: '/transaction/purchase-order/add',
      detail: (id: string) => `/transaction/purchase-order/${id}/detail`,
      edit: (id: string) => `/transaction/purchase-order/${id}/edit`
    },
    salesOrder: {
      data: '/transaction/sales-order',
      add: '/transaction/sales-order/add',
      detail: (id: string) => `/transaction/sales-order/${id}/detail`,
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
