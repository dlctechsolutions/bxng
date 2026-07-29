import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  adminDeleteCollection,
  adminListCollections,
  adminSaveCollection,
  type CollectionInput,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/collections")({
  component: AdminCollections,
});

const empty: CollectionInput = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  banner_image: "",
  sort_order: 0,
};

function AdminCollections() {
  const list = useServerFn(adminListCollections);
  const save = useServerFn(adminSaveCollection);
  const del = useServerFn(adminDeleteCollection);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<(CollectionInput & { id?: string }) | null>(null);

  const collections = useQuery({ queryKey: ["admin", "collections"], queryFn: () => list({}) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const saveMutation = useMutation({
    mutationFn: (input: CollectionInput) => save({ data: input }),
    onSuccess: () => {
      toast.success("Collection saved");
      setEditing(null);
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Collection deleted");
      refresh();
    },
    onError: () => toast.error("Delete failed — remove its products first."),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Collections ({collections.data?.length ?? 0})</h2>
        <Button onClick={() => setEditing({ ...empty })}>New collection</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(collections.data ?? []).map((c: any) => (
          <div key={c.id} className="border border-border bg-card p-5">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">/{c.slug}</p>
            <h3 className="mt-2 text-lg">{c.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.tagline}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing({ ...c })}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => confirm(`Delete ${c.name}?`) && removeMutation.mutate(c.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit collection" : "New collection"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div>
                <Label>Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input
                  value={editing.tagline ?? ""}
                  onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Banner image URL</Label>
                <Input
                  value={editing.banner_image ?? ""}
                  onChange={(e) => setEditing({ ...editing, banner_image: e.target.value })}
                />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return;
                if (!editing.name || !editing.slug) {
                  toast.error("Name and slug are required");
                  return;
                }
                saveMutation.mutate(editing);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
