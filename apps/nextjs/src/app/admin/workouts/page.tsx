import { Suspense } from "react";

import { api } from "~/trpc/server";
import Layout from "../admin-layout";
import { AddWorkoutButton } from "./[id]/add-workout-button";
import { WorkoutsTable } from "./workouts-table";

const WorkoutsPage = async () => {
  const workouts = await api.event.all();

  return (
    <Layout>
      <div className="flex w-full  flex-col">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">Events</h1>
          <div className="flex flex-row items-center justify-start gap-2">
            <AddWorkoutButton />
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex  w-full  flex-col overflow-auto">
            <WorkoutsTable workouts={workouts} />
          </div>
        </Suspense>
      </div>
    </Layout>
  );
};

export default WorkoutsPage;
