import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export function useWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: productIds = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("wishlist_items").select("product_id");
      if (error) throw error;
      return data.map((r) => r.product_id);
    },
  });

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Sign in to save items to your wishlist.");
      if (productIds.includes(productId)) {
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("product_id", productId)
          .eq("user_id", user.id);
        if (error) throw error;
        return "removed" as const;
      }
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ product_id: productId, user_id: user.id });
      if (error) throw error;
      return "added" as const;
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(result === "added" ? "Saved to wishlist" : "Removed from wishlist");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    productIds,
    isLoading,
    isSignedIn: !!user,
    has: (id: string) => productIds.includes(id),
    toggle: (id: string) => toggle.mutate(id),
    pending: toggle.isPending,
  };
}
