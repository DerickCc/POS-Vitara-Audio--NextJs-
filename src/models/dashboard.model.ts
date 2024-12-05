export interface OverviewMetricsResult {
  newCustomers: number;
  newProducts: number;
  totalSales: number;
  onGoingPo: number;
}

export interface IncompletePaymentModel {
  soId: string;
  soCode: string;
  customerName: string;
  grandTotal: number;
  paidAmount: number;
}

export interface LowStockProductModel {
  productId: string;
  productName: string;
  stock: number;
  uom: string;
}