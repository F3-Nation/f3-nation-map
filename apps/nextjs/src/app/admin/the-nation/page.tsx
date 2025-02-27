import { Suspense } from "react";

import { api } from "~/trpc/server";
import Layout from "../admin-layout";
import { AddNationButton } from "./[id]/add-nation-button";
import { NationsTable } from "./nations-table";

const NationsPage = async () => {
  const nations = await api.nation.all();

  return (
    <Layout>
      <div className="flex w-full  flex-col">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">Nations</h1>
          <div className="flex flex-row items-center justify-start gap-2">
            <AddNationButton />
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex  w-full  flex-col overflow-auto">
            <NationsTable nations={nations} />
          </div>
        </Suspense>
      </div>
    </Layout>
  );
};

export default NationsPage;
