import { client } from "@repo/db/client";

// Force dynamic rendering since this page requires database access
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await client.user.findFirst();
  return (
    <div>
      <h1>Users</h1>
      <p>{user?.username}</p>
      <p>{user?.password}</p>
    </div>
  );
}
