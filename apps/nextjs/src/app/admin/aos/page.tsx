import { Suspense } from "react";

import Layout from "../admin-layout";
import { AddAOButton } from "./[id]/add-ao-button";
import { AOsTable } from "./aos-table";

const AOPage = async () => {
  return (
    <Layout>
      <div className="flex w-full  flex-col">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">AOs</h1>
          <div className="flex flex-row items-center justify-start gap-2">
            <AddAOButton />
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex  w-full  flex-col overflow-auto">
            <AOsTable />
          </div>
        </Suspense>
      </div>
    </Layout>
  );
};

export default AOPage;
