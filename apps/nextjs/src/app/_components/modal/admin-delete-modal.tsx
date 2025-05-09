"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Z_INDEX } from "@acme/shared/app/constants";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { toast } from "@acme/ui/toast";

import type { DataType, ModalType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { vanillaApi } from "~/trpc/vanilla";
import { closeModal, DeleteType } from "~/utils/store/modal";

export default function AdminDeleteModal({
  data,
}: {
  data: DataType[ModalType.ADMIN_DELETE_CONFIRMATION];
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();

  let mutation: ({ id }: { id: number }) => Promise<void>;

  switch (data.type) {
    case DeleteType.NATION:
    case DeleteType.SECTOR:
    case DeleteType.AREA:
    case DeleteType.REGION:
    case DeleteType.AO:
      mutation = vanillaApi.org.delete.mutate;
      break;
    case DeleteType.EVENT:
      mutation = vanillaApi.event.delete.mutate;
      break;
    case DeleteType.EVENT_TYPE:
      mutation = vanillaApi.eventType.delete.mutate;
      break;
    case DeleteType.USER:
      mutation = vanillaApi.user.delete.mutate;
      break;
    case DeleteType.LOCATION:
      mutation = vanillaApi.location.delete.mutate;
      break;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid delete type: ${data.type}`);
  }

  const handleDelete = async (id: number) => {
    setIsPending(true);
    await mutation({ id })
      .then(() => {
        closeModal();
        toast.success(`Successfully deleted ${data.type.toLowerCase()}`);

        switch (data.type) {
          case DeleteType.NATION:
          case DeleteType.SECTOR:
          case DeleteType.AREA:
          case DeleteType.REGION:
          case DeleteType.AO:
            void utils.org.invalidate();
            break;
          case DeleteType.EVENT:
            void utils.event.invalidate();
            break;
          case DeleteType.USER:
            void utils.user.invalidate();
            break;
          case DeleteType.LOCATION:
            void utils.location.invalidate();
            break;
          default:
            throw new Error(`Invalid delete type: ${data.type}`);
        }
        router.refresh();
      })
      .catch((err) => {
        console.error("delete-modal err", err);
        toast.error(`Failed to delete ${data.type}`);
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg lg:max-w-[400px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Delete Record</DialogTitle>
        </DialogHeader>

        <div className="my-6 w-full px-3">
          {`Are you sure you want to delete this ${data.type.toLowerCase()}?`}
        </div>
        <div className="mb-2 w-full px-2">
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => closeModal()}
              className="w-full"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full"
              onClick={() => handleDelete(data.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
