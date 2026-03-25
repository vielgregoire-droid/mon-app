import { createClient } from "./server";

// Map snake_case DB rows to camelCase for existing component interfaces

function mapSeller(row: Record<string, unknown>) {
  return {
    id: row.id,
    environment: row.environment,
    first_name: row.first_name,
    last_name: row.last_name,
    full_name: row.full_name,
    gender: row.gender,
    created_at: row.created_at,
    local_status: row.local_status,
    standard_status: row.standard_status,
    hierarchy_level: row.hierarchy_level,
    manager_name: row.manager_name,
    manager_id: row.manager_id,
    sales_leader_name: row.sales_leader_name,
    sales_leader_id: row.sales_leader_id,
    recruiter_name: row.recruiter_name,
    recruiter_id: row.recruiter_id,
    is_active: row.is_active,
    total_sales: Number(row.total_sales),
    order_count: row.order_count,
    first_order_date: row.first_order_date,
    last_order_date: row.last_order_date,
    pipeline_status: row.pipeline_status,
    months_since_creation: row.months_since_creation,
    months_since_last_order: row.months_since_last_order,
    days_since_creation: row.days_since_creation,
    avg_monthly_sales: Number(row.avg_monthly_sales),
  };
}

function mapOrder(row: Record<string, unknown>) {
  return {
    ref: row.ref,
    date: row.date,
    paidDate: row.paid_date,
    environment: row.environment,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    customerId: row.customer_id,
    status: row.status,
    orderType: row.order_type,
    deliveryMode: row.delivery_mode,
    isWebOrder: row.is_web_order,
    totalItems: row.total_items,
    totalQuantity: row.total_quantity,
    totalAmountInclTax: Number(row.total_amount_incl_tax),
    totalDiscountInclTax: Number(row.total_discount_incl_tax),
    totalPaidInclTax: Number(row.total_paid_incl_tax),
    deliveryAmount: Number(row.delivery_amount),
    orderWeek: row.order_week,
    managerName: row.manager_name,
    salesLeaderName: row.sales_leader_name,
  };
}

function mapLead(row: Record<string, unknown>) {
  return {
    id: row.id,
    source: row.source,
    first_name: row.first_name,
    last_name: row.last_name,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    postal_code: row.postal_code,
    country_raw: row.country_raw,
    country: row.country,
    intent: row.intent,
    motivation: row.motivation,
    preferred_contact_time: row.preferred_contact_time,
    message: row.message,
    submitted_at: row.submitted_at,
    status: row.status,
    days_since_submission: row.days_since_submission,
  };
}

function mapBpRow(row: Record<string, unknown>) {
  return {
    row: row.row,
    label: row.label,
    level: row.level,
    isHeader: row.is_header,
    section: row.section,
    annuals: row.annuals as Record<string, number>,
    monthly: row.monthly as Record<string, number>,
  };
}

function mapTopProduct(row: Record<string, unknown>) {
  return {
    productRef: row.product_ref,
    environment: row.environment,
    totalQty: row.total_qty,
    totalRevenue: Number(row.total_revenue),
    totalDiscount: Number(row.total_discount),
    totalProductDiscount: Number(row.total_product_discount),
    totalOrderDiscount: Number(row.total_order_discount),
    orderCount: row.order_count,
    avgPrice: Number(row.avg_price),
    discountRate: Number(row.discount_rate),
  };
}

function mapPromoMonthly(row: Record<string, unknown>) {
  return {
    environment: row.environment,
    month: row.month,
    totalRevenue: Number(row.total_revenue),
    totalDiscount: Number(row.total_discount),
    totalProductDiscount: Number(row.total_product_discount),
    totalOrderDiscount: Number(row.total_order_discount),
    itemCount: row.item_count,
    orderCount: row.order_count,
    discountedOrderCount: row.discounted_order_count,
    discountRate: Number(row.discount_rate),
  };
}

// Paginated fetch to get all rows (Supabase default limit is 1000)
async function fetchAll(supabase: Awaited<ReturnType<typeof createClient>>, table: string, orderCol: string, filter?: { col: string; val: string }, ascending = true) {
  const pageSize = 1000;
  const allData: Record<string, unknown>[] = [];
  let from = 0;
  while (true) {
    let query = supabase.from(table).select("*").order(orderCol, { ascending }).range(from, from + pageSize - 1);
    if (filter) query = query.eq(filter.col, filter.val);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) break;
    allData.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return allData;
}

export async function fetchSellers() {
  const supabase = await createClient();
  const data = await fetchAll(supabase, "sellers", "id");
  return data.map(mapSeller);
}

export async function fetchOrders(environment?: string) {
  const supabase = await createClient();
  const filter = environment && environment !== "ALL" ? { col: "environment", val: environment } : undefined;
  const data = await fetchAll(supabase, "orders", "date", filter, false);
  return data.map(mapOrder);
}

export async function fetchLeads() {
  const supabase = await createClient();
  const data = await fetchAll(supabase, "leads", "id");
  return data.map(mapLead);
}

export async function fetchBpRows() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bp_rows").select("*").order("row");
  if (error) throw error;
  return (data ?? []).map(mapBpRow);
}

export async function fetchTopProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("top_products").select("*").order("total_revenue", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTopProduct);
}

export async function fetchPromoMonthly() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("promo_monthly").select("*").order("month");
  if (error) throw error;
  return (data ?? []).map(mapPromoMonthly);
}
