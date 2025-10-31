import type { Context } from "../trpc";
import type {
  UpdateRequestDataWithRequiredRegionId,
  UpdateRequestResponse,
} from "./types";
import {
  handleCreateEvent,
  handleCreateLocationAndEvent,
  handleEditAOAndLocation,
  handleEditEvent,
  handleLegacyEdit,
  handleMoveAOToDifferentLocation,
  handleMoveAOToDifferentRegion,
  handleMoveAOToNewLocation,
  handleMoveEventToDifferentAo,
  handleMoveEventToNewLocation,
} from "./update-request-handlers";

/**
 * Master function that handles all aspects of an update request
 */
export const applyUpdateRequest = async (
  ctx: Context,
  updateRequest: UpdateRequestDataWithRequiredRegionId,
): Promise<UpdateRequestResponse> => {
  // Handle the request based on the request type
  switch (updateRequest.requestType) {
    case "create_location_and_event":
      return handleCreateLocationAndEvent(ctx, updateRequest);

    case "create_event":
      return handleCreateEvent(ctx, updateRequest);

    case "edit_event":
      return handleEditEvent(ctx, updateRequest);

    case "edit_ao_and_location":
      return handleEditAOAndLocation(ctx, updateRequest);

    case "move_ao_to_different_region":
      return handleMoveAOToDifferentRegion(ctx, updateRequest);

    case "move_ao_to_new_location":
      return handleMoveAOToNewLocation(ctx, updateRequest);

    case "move_ao_to_different_location":
      return handleMoveAOToDifferentLocation(ctx, updateRequest);

    case "move_event_to_different_ao":
      return handleMoveEventToDifferentAo(ctx, updateRequest);

    case "move_event_to_new_location":
      return handleMoveEventToNewLocation(ctx, updateRequest);

    case "edit":
      // Legacy handler for backward compatibility
      return handleLegacyEdit(ctx, updateRequest);

    default:
      throw new Error(`Unsupported request type: ${updateRequest.requestType}`);
  }
};
