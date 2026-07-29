import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type OrderLine = {
  productId: string | null;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  image: string | null;
  unitPrice: number;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
  phone?: string;
};

type PlaceOrderInput = {
  email: string;
  shippingAddress: ShippingAddress;
  items: OrderLine[];
};

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PlaceOrderInput) => data)
  .handler(async ({ data, context }) => {
    if (!data.items.length) throw new Error("Your bag is empty.");

    const subtotal = data.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 4.95;
    const total = subtotal + shipping;
    const orderNumber = `44-${Date.now().toString(36).toUpperCase()}`;

    const { data: order, error } = await context.supabase
      .from("orders")
      .insert({
        user_id: context.userId,
        order_number: orderNumber,
        status: "pending",
        subtotal,
        shipping,
        total,
        email: data.email,
        shipping_address: data.shippingAddress,
      })
      .select("id, order_number, total")
      .single();
    if (error) throw error;

    const { error: itemsError } = await context.supabase.from("order_items").insert(
      data.items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        variant_id: i.variantId,
        name: i.name,
        variant_label: i.variantLabel,
        image: i.image,
        unit_price: i.unitPrice,
        quantity: i.quantity,
      })),
    );
    if (itemsError) throw itemsError;

    return { orderNumber: order.order_number, total: Number(order.total) };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, status, subtotal, shipping, total, created_at, order_items(id, name, variant_label, image, unit_price, quantity)",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, phone")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { fullName: string; phone: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, full_name: data.fullName, phone: data.phone })
      .eq("id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
