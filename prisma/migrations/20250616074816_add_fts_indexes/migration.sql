-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" TEXT NOT NULL,
    "account_status" BOOLEAN NOT NULL DEFAULT true,
    "role" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customers" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "license_plate" VARCHAR(20) NOT NULL,
    "phoneNo" VARCHAR(20),
    "address" VARCHAR(250),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "pic" VARCHAR(100),
    "phoneNo" VARCHAR(20),
    "address" VARCHAR(250),
    "remarks" VARCHAR(500),
    "receivables" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "receivablesLimit" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "stock" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "restock_threshold" DECIMAL(10,2) NOT NULL,
    "uom" VARCHAR(50) NOT NULL,
    "cost_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "purchase_price" DECIMAL(10,2) DEFAULT 0,
    "purchase_price_code" VARCHAR(50) NOT NULL DEFAULT 'I',
    "selling_price" DECIMAL(10,2) NOT NULL,
    "remarks" VARCHAR(500),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrders" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplier_id" TEXT NOT NULL,
    "remarks" VARCHAR(500),
    "total_item" INTEGER NOT NULL,
    "sub_total" DECIMAL(15,2) NOT NULL,
    "applied_receivables" DECIMAL(10,2) NOT NULL,
    "grand_total" DECIMAL(15,2) NOT NULL,
    "progress_status" VARCHAR(50) NOT NULL DEFAULT 'Dalam Proses',
    "payment_status" VARCHAR(50) NOT NULL DEFAULT 'Belum Lunas',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "PurchaseOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderDetails" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "purchase_price" DECIMAL(15,2) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "returned_quantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(15,2) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "PurchaseOrderDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderPaymentHistories" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrderPaymentHistories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrders" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "sales_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entry_date" TIMESTAMP(3) NOT NULL,
    "customer_id" TEXT NOT NULL,
    "payment_type" VARCHAR(20) NOT NULL,
    "sub_total" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(15,2) NOT NULL,
    "remarks" VARCHAR(500),
    "progress_status" VARCHAR(50) NOT NULL DEFAULT 'Belum Dikerjakan',
    "payment_status" VARCHAR(50) NOT NULL DEFAULT 'Belum Lunas',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "SalesOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderProductDetails" (
    "id" TEXT NOT NULL,
    "so_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "ori_selling_price" DECIMAL(10,2) NOT NULL,
    "selling_price" DECIMAL(15,2) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "returned_quantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(15,2) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "SalesOrderProductDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderServiceDetails" (
    "id" TEXT NOT NULL,
    "so_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "selling_price" DECIMAL(15,2) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(15,2) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "SalesOrderServiceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderPaymentHistories" (
    "id" TEXT NOT NULL,
    "so_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesOrderPaymentHistories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReturns" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_type" VARCHAR(30) NOT NULL,
    "grand_total" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Dalam Proses',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "PurchaseReturns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReturnDetails" (
    "id" TEXT NOT NULL,
    "pr_id" TEXT NOT NULL,
    "pod_id" TEXT NOT NULL,
    "return_price" DECIMAL(15,2) NOT NULL,
    "return_quantity" DECIMAL(10,2) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "PurchaseReturnDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturns" (
    "id" TEXT NOT NULL,
    "so_id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grand_total" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Selesai',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "SalesReturns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnProductDetails" (
    "id" TEXT NOT NULL,
    "sr_id" TEXT NOT NULL,
    "sopd_id" TEXT NOT NULL,
    "return_price" DECIMAL(15,2) NOT NULL,
    "return_quantity" DECIMAL(10,2) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "SalesReturnProductDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnServiceDetails" (
    "id" TEXT NOT NULL,
    "sr_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "return_quantity" DECIMAL(10,2) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "SalesReturnServiceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE INDEX "users_index" ON "Users"("name", "account_status", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Customers_code_key" ON "Customers"("code");

-- CreateIndex
CREATE INDEX "customers_index" ON "Customers"("code", "name", "license_plate", "phoneNo", "address");

-- CreateIndex
CREATE INDEX "customer_multi_column_fts_idx" ON "Customers"
USING GIN (
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(license_plate, ''))
);

-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_code_key" ON "Suppliers"("code");

-- CreateIndex
CREATE INDEX "suppliers_index" ON "Suppliers"("code", "name", "pic", "phoneNo", "address", "receivables");

-- CreateIndex
CREATE INDEX "supplier_name_simple_fts_idx" ON "Suppliers" USING GIN (to_tsvector('simple', name));

-- CreateIndex
CREATE UNIQUE INDEX "Products_code_key" ON "Products"("code");

-- CreateIndex
CREATE INDEX "products_index" ON "Products"("code", "name", "stock", "uom");

-- CreateIndex
CREATE INDEX "product_name_simple_fts_idx" ON "Products" USING GIN (to_tsvector('simple', name));

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrders_code_key" ON "PurchaseOrders"("code");

-- CreateIndex
CREATE INDEX "purchase_orders_index" ON "PurchaseOrders"("code", "purchase_date", "supplier_id", "grand_total", "progress_status", "payment_status");

-- CreateIndex
CREATE INDEX "PurchaseOrders_progress_status_created_at_idx" ON "PurchaseOrders"("progress_status", "created_at");

-- CreateIndex
CREATE INDEX "PurchaseOrderDetails_po_id_idx" ON "PurchaseOrderDetails"("po_id");

-- CreateIndex
CREATE INDEX "PurchaseOrderDetails_product_id_idx" ON "PurchaseOrderDetails"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrders_code_key" ON "SalesOrders"("code");

-- CreateIndex
CREATE INDEX "sales_orders_index" ON "SalesOrders"("code", "sales_date", "customer_id", "payment_type", "grand_total", "progress_status", "payment_status");

-- CreateIndex
CREATE INDEX "SalesOrders_progress_status_created_at_idx" ON "SalesOrders"("progress_status", "created_at");

-- CreateIndex
CREATE INDEX "SalesOrderProductDetails_so_id_idx" ON "SalesOrderProductDetails"("so_id");

-- CreateIndex
CREATE INDEX "SalesOrderProductDetails_product_id_idx" ON "SalesOrderProductDetails"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseReturns_code_key" ON "PurchaseReturns"("code");

-- CreateIndex
CREATE INDEX "purchase_returns_index" ON "PurchaseReturns"("code", "return_date", "return_type", "grand_total", "status");

-- CreateIndex
CREATE INDEX "PurchaseReturns_status_created_at_idx" ON "PurchaseReturns"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "SalesReturns_code_key" ON "SalesReturns"("code");

-- CreateIndex
CREATE INDEX "sales_returns_index" ON "SalesReturns"("code", "return_date", "grand_total", "status");

-- CreateIndex
CREATE INDEX "SalesReturns_status_created_at_idx" ON "SalesReturns"("status", "created_at");

-- AddForeignKey
ALTER TABLE "Customers" ADD CONSTRAINT "Customers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customers" ADD CONSTRAINT "Customers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suppliers" ADD CONSTRAINT "Suppliers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suppliers" ADD CONSTRAINT "Suppliers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderDetails" ADD CONSTRAINT "PurchaseOrderDetails_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PurchaseOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderDetails" ADD CONSTRAINT "PurchaseOrderDetails_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderDetails" ADD CONSTRAINT "PurchaseOrderDetails_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderDetails" ADD CONSTRAINT "PurchaseOrderDetails_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderPaymentHistories" ADD CONSTRAINT "PurchaseOrderPaymentHistories_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PurchaseOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderPaymentHistories" ADD CONSTRAINT "PurchaseOrderPaymentHistories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrders" ADD CONSTRAINT "SalesOrders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrders" ADD CONSTRAINT "SalesOrders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrders" ADD CONSTRAINT "SalesOrders_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderProductDetails" ADD CONSTRAINT "SalesOrderProductDetails_so_id_fkey" FOREIGN KEY ("so_id") REFERENCES "SalesOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderProductDetails" ADD CONSTRAINT "SalesOrderProductDetails_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderProductDetails" ADD CONSTRAINT "SalesOrderProductDetails_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderProductDetails" ADD CONSTRAINT "SalesOrderProductDetails_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderServiceDetails" ADD CONSTRAINT "SalesOrderServiceDetails_so_id_fkey" FOREIGN KEY ("so_id") REFERENCES "SalesOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderServiceDetails" ADD CONSTRAINT "SalesOrderServiceDetails_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderServiceDetails" ADD CONSTRAINT "SalesOrderServiceDetails_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderPaymentHistories" ADD CONSTRAINT "SalesOrderPaymentHistories_so_id_fkey" FOREIGN KEY ("so_id") REFERENCES "SalesOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderPaymentHistories" ADD CONSTRAINT "SalesOrderPaymentHistories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturns" ADD CONSTRAINT "PurchaseReturns_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "PurchaseOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturns" ADD CONSTRAINT "PurchaseReturns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturns" ADD CONSTRAINT "PurchaseReturns_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnDetails" ADD CONSTRAINT "PurchaseReturnDetails_pr_id_fkey" FOREIGN KEY ("pr_id") REFERENCES "PurchaseReturns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnDetails" ADD CONSTRAINT "PurchaseReturnDetails_pod_id_fkey" FOREIGN KEY ("pod_id") REFERENCES "PurchaseOrderDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnDetails" ADD CONSTRAINT "PurchaseReturnDetails_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnDetails" ADD CONSTRAINT "PurchaseReturnDetails_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturns" ADD CONSTRAINT "SalesReturns_so_id_fkey" FOREIGN KEY ("so_id") REFERENCES "SalesOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturns" ADD CONSTRAINT "SalesReturns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturns" ADD CONSTRAINT "SalesReturns_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnProductDetails" ADD CONSTRAINT "SalesReturnProductDetails_sr_id_fkey" FOREIGN KEY ("sr_id") REFERENCES "SalesReturns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnProductDetails" ADD CONSTRAINT "SalesReturnProductDetails_sopd_id_fkey" FOREIGN KEY ("sopd_id") REFERENCES "SalesOrderProductDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnProductDetails" ADD CONSTRAINT "SalesReturnProductDetails_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnProductDetails" ADD CONSTRAINT "SalesReturnProductDetails_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnServiceDetails" ADD CONSTRAINT "SalesReturnServiceDetails_sr_id_fkey" FOREIGN KEY ("sr_id") REFERENCES "SalesReturns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnServiceDetails" ADD CONSTRAINT "SalesReturnServiceDetails_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnServiceDetails" ADD CONSTRAINT "SalesReturnServiceDetails_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
