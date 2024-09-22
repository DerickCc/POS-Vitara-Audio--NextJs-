export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const pageIndex = Number(queryParams.get('pageIndex')) ?? 0;
  const pageSize = Number(queryParams.get('pageSize')) ?? 10;
  const sortOrder  = queryParams.get('sortOrder') ?? 'desc';
  const sortColumn   = queryParams.get('sortColumn') ?? 'createdAt';

  // filters
  const name = queryParams.get('name') ?? '';
  const stockOperator =  queryParams.get('stockOperator') ?? 'gte';
  const stock =  Number(queryParams.get('stock')) ?? 0;
  const uom =  queryParams.get('uom') ?? '';

  const where: any = {};
}