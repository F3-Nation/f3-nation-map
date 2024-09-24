import { api } from "~/trpc/server";

// for method GET
export async function GET() {
  const data = await api.metrics();

  return Response.json(data);
}
