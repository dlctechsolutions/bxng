import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { adminListUsers, adminSetAdminRole } from "@/lib/admin.functions";
import { money } from "@/lib/format";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const list = useServerFn(adminListUsers);
  const setRole = useServerFn(adminSetAdminRole);
  const queryClient = useQueryClient();

  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => list({}) });

  const update = useMutation({
    mutationFn: (v: { userId: string; makeAdmin: boolean }) => setRole({ data: v }),
    onSuccess: () => {
      toast.success("Roles updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not update role"),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg">Users ({users.data?.length ?? 0})</h2>
      {users.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-right">Orders</th>
                <th className="p-3 text-right">Spend</th>
                <th className="p-3 text-right">Admin</th>
              </tr>
            </thead>
            <tbody>
              {(users.data ?? []).map((u: any) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3">{u.email ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{u.fullName ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-3 text-right">{u.orderCount}</td>
                  <td className="p-3 text-right">{money(u.spend)}</td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <Switch
                        checked={u.roles.includes("admin")}
                        onCheckedChange={(v) => update.mutate({ userId: u.id, makeAdmin: v })}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
