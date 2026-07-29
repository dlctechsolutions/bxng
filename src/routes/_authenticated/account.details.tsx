import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyProfile, updateMyProfile } from "@/lib/account.functions";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/account/details")({
  head: () => ({
    meta: [
      { title: "Account Details | 44 Boxing" },
      { name: "description", content: "Update the name and phone number on your 44 Boxing account." },
      { property: "og:title", content: "Account Details | 44 Boxing" },
      { property: "og:description", content: "Update your 44 Boxing account details." },
    ],
  }),
  component: DetailsPage,
});

function DetailsPage() {
  const { user } = useAuth();
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => saveProfile({ data: { fullName, phone } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Details saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      className="max-w-md space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={user?.email ?? ""} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <Button type="submit" size="lg" disabled={mutation.isPending}>
        Save changes
      </Button>
    </form>
  );
}
