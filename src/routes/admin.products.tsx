import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminDeleteProduct,
  adminDeleteVariant,
  adminListCollections,
  adminListProducts,
  adminSaveProduct,
  adminSaveVariant,
  type ProductInput,
} from "@/lib/admin.functions";
import { money, num } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const emptyProduct = (collectionId: string): ProductInput => ({
  collection_id: collectionId,
  slug: "",
  name: "",
  category: "Boxing Gloves",
  description: "",
  details: "",
  price: 0,
  sale_price: null,
  images: [],
  has_variants: true,
  in_stock: true,
  featured: false,
  sort_order: 0,
});

function AdminProducts() {
  const listProducts = useServerFn(adminListProducts);
  const listCollections = useServerFn(adminListCollections);
  const saveProduct = useServerFn(adminSaveProduct);
  const deleteProduct = useServerFn(adminDeleteProduct);
  const saveVariant = useServerFn(adminSaveVariant);
  const deleteVariant = useServerFn(adminDeleteVariant);
  const queryClient = useQueryClient();

  const products = useQuery({ queryKey: ["admin", "products"], queryFn: () => listProducts({}) });
  const collections = useQuery({ queryKey: ["admin", "collections"], queryFn: () => listCollections({}) });

  const [editing, setEditing] = useState<(ProductInput & { id?: string }) | null>(null);
  const [variantsFor, setVariantsFor] = useState<any | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const save = useMutation({
    mutationFn: (input: ProductInput) => saveProduct({ data: input }),
    onSuccess: () => {
      toast.success("Product saved");
      setEditing(null);
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save product"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not delete product"),
  });

  const variantSave = useMutation({
    mutationFn: (v: any) => saveVariant({ data: v }),
    onSuccess: () => {
      toast.success("Variant saved");
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save variant"),
  });

  const variantRemove = useMutation({
    mutationFn: (id: string) => deleteVariant({ data: { id } }),
    onSuccess: () => {
      toast.success("Variant removed");
      refresh();
    },
  });

  const cols = collections.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Products ({products.data?.length ?? 0})</h2>
        <Button disabled={!cols.length} onClick={() => setEditing(emptyProduct(cols[0]?.id))}>
          New product
        </Button>
      </div>

      {products.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Collection</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Sale</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(products.data ?? []).map((p: any) => {
                const stock = (p.product_variants ?? []).reduce(
                  (s: number, v: any) => s + Number(v.stock ?? 0),
                  0,
                );
                return (
                  <tr key={p.id} className="border-t border-border align-middle">
                    <td className="p-3">
                      <span className="block">{p.name}</span>
                      <span className="text-xs text-muted-foreground">/{p.slug}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {cols.find((c: any) => c.id === p.collection_id)?.name ?? "—"}
                    </td>
                    <td className="p-3 text-right">{money(p.price)}</td>
                    <td className="p-3 text-right">{p.sale_price ? money(p.sale_price) : "—"}</td>
                    <td className={`p-3 text-right ${stock <= 0 ? "text-primary" : ""}`}>
                      {p.has_variants ? stock : p.in_stock ? "In stock" : "Out"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setVariantsFor(p)}>
                          Variants
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditing({
                              id: p.id,
                              collection_id: p.collection_id,
                              slug: p.slug,
                              name: p.name,
                              category: p.category,
                              description: p.description,
                              details: p.details,
                              price: num(p.price),
                              sale_price: p.sale_price ? num(p.sale_price) : null,
                              images: p.images ?? [],
                              has_variants: p.has_variants,
                              in_stock: p.in_stock,
                              featured: p.featured,
                              sort_order: p.sort_order,
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete ${p.name}?`)) remove.mutate(p.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product editor */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </div>
              <div>
                <Label>Collection</Label>
                <select
                  className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm"
                  value={editing.collection_id}
                  onChange={(e) => setEditing({ ...editing, collection_id: e.target.value })}
                >
                  {cols.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Price (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Sale price (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editing.sale_price ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sale_price: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Image URLs (one per line)</Label>
                <Textarea
                  rows={3}
                  value={(editing.images ?? []).join("\n")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Details</Label>
                <Textarea
                  rows={3}
                  value={editing.details ?? ""}
                  onChange={(e) => setEditing({ ...editing, details: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between border border-border p-3">
                <span className="text-sm">Has variants</span>
                <Switch
                  checked={editing.has_variants}
                  onCheckedChange={(v) => setEditing({ ...editing, has_variants: v })}
                />
              </div>
              <div className="flex items-center justify-between border border-border p-3">
                <span className="text-sm">In stock</span>
                <Switch
                  checked={editing.in_stock}
                  onCheckedChange={(v) => setEditing({ ...editing, in_stock: v })}
                />
              </div>
              <div className="flex items-center justify-between border border-border p-3">
                <span className="text-sm">Featured</span>
                <Switch
                  checked={editing.featured}
                  onCheckedChange={(v) => setEditing({ ...editing, featured: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              disabled={save.isPending}
              onClick={() => {
                if (!editing) return;
                if (!editing.name || !editing.slug) {
                  toast.error("Name and slug are required");
                  return;
                }
                save.mutate(editing);
              }}
            >
              Save product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variants */}
      <Dialog open={!!variantsFor} onOpenChange={(o) => !o && setVariantsFor(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{variantsFor?.name} — variants</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(products.data ?? [])
              .find((p: any) => p.id === variantsFor?.id)
              ?.product_variants?.map((v: any) => (
                <div key={v.id} className="flex flex-wrap items-end gap-2 border border-border p-3">
                  <div className="flex-1">
                    <Label>Colour</Label>
                    <Input defaultValue={v.color} id={`c-${v.id}`} />
                  </div>
                  <div className="flex-1">
                    <Label>Fastening</Label>
                    <Input defaultValue={v.fastening} id={`f-${v.id}`} />
                  </div>
                  <div className="w-24">
                    <Label>Stock</Label>
                    <Input type="number" defaultValue={v.stock} id={`s-${v.id}`} />
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      variantSave.mutate({
                        id: v.id,
                        product_id: v.product_id,
                        color: (document.getElementById(`c-${v.id}`) as HTMLInputElement).value,
                        fastening: (document.getElementById(`f-${v.id}`) as HTMLInputElement).value,
                        stock: Number((document.getElementById(`s-${v.id}`) as HTMLInputElement).value),
                      })
                    }
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => variantRemove.mutate(v.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            <div className="flex flex-wrap items-end gap-2 border border-dashed border-border p-3">
              <div className="flex-1">
                <Label>Colour</Label>
                <Input id="new-color" placeholder="Black" />
              </div>
              <div className="flex-1">
                <Label>Fastening</Label>
                <Input id="new-fastening" placeholder="Velcro" />
              </div>
              <div className="w-24">
                <Label>Stock</Label>
                <Input id="new-stock" type="number" defaultValue={0} />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const color = (document.getElementById("new-color") as HTMLInputElement).value;
                  const fastening = (document.getElementById("new-fastening") as HTMLInputElement).value;
                  const stock = Number((document.getElementById("new-stock") as HTMLInputElement).value);
                  if (!color || !fastening) {
                    toast.error("Colour and fastening are required");
                    return;
                  }
                  variantSave.mutate({ product_id: variantsFor.id, color, fastening, stock });
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
