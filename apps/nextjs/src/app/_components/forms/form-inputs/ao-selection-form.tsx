import { useMemo } from "react";
import { Controller } from "react-hook-form";

import { api } from "~/trpc/react";
import { useUpdateFormContext } from "~/utils/forms";
import { VirtualizedCombobox } from "../../virtualized-combobox";

export const AOSelectionForm = () => {
  const form = useUpdateFormContext();
  const formRegionId = form.watch("regionId");

  // Get regions data
  const { data: aos } = api.org.all.useQuery({
    orgTypes: ["ao"],
    parentOrgIds: [formRegionId],
    pageSize: 200,
  });

  const options = useMemo(() => {
    return (
      aos?.orgs
        ?.map((ao) => ({
          label: `${ao.name} (${ao.parentOrgName})`,
          value: ao.id.toString(),
        }))
        ?.sort((a, b) => a.label.localeCompare(b.label)) ??
      [] ??
      []
    );
  }, [aos]);

  return (
    <>
      <h2 className="mb-2 mt-4 text-xl font-semibold text-muted-foreground">
        AO Selection:
      </h2>
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">AO</div>
        <div className="mb-3">
          <Controller
            control={form.control}
            name="aoId"
            render={({ field, fieldState }) => (
              <>
                <VirtualizedCombobox
                  key={formRegionId?.toString()}
                  options={options}
                  value={field.value?.toString()}
                  onSelect={(item) => {
                    const ao = aos?.orgs?.find(
                      (ao) => ao.id.toString() === item,
                    );
                    if (ao) {
                      field.onChange(ao.id);
                    }
                  }}
                  searchPlaceholder="Select"
                />
                <p className="text-xs text-destructive">
                  {fieldState.error?.message?.toString()}
                </p>
              </>
            )}
          />
        </div>
      </div>
    </>
  );
};
