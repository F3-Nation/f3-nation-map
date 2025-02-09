import { api } from "~/trpc/server";
import UserMutate from "./user-mutate";

export default async function UserEditPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await api.user.byId({ id: Number(params.id) });
  return <UserMutate user={user} />;
}
