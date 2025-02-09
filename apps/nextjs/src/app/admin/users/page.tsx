import { Suspense } from "react";

import { api } from "~/trpc/server";
import Layout from "../admin-layout";
import { AddUserButton } from "./[id]/add-user-button";
import { UserTable } from "./user-table";

const UsersPage = async () => {
  const users = await api.user.all();

  return (
    <Layout>
      <div className="flex w-full flex-col">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <div className="flex flex-row items-center justify-start gap-2">
            <AddUserButton />
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex  w-full  flex-col overflow-auto">
            <UserTable users={users} />
          </div>
        </Suspense>
      </div>
    </Layout>
  );
};

export default UsersPage;
