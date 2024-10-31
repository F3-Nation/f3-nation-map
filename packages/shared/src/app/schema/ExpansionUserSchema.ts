import { z } from "zod";

import { dateOrIso } from "../functions";

export const ExpansionUserBaseModal = z.object({
  id: z.string(),
  area: z.string(),
  interestedInOrganizing: z.enum(["yes", "no"]),
  pinnedLat: z.number(),
  pinnedLng: z.number(),
  userLat: z.number(),
  userLng: z.number(),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  created: dateOrIso.nullish().nullish(),
  updated: dateOrIso.nullish().nullish(),
});

export const ExpansionUserBaseSchema = ExpansionUserBaseModal.pick({
  id: true,
  area: true,
  interestedInOrganizing: true,
  pinnedLat: true,
  pinnedLng: true,
  userLat: true,
  userLng: true,
  phone: true,
  email: true,
  created: true,
  updated: true,
});

export type ExpansionUserResponse = z.infer<typeof ExpansionUserBaseSchema>;

export const CreateExpansionUserRequestSchema = ExpansionUserBaseModal.pick({
  area: true,
  interestedInOrganizing: true,
  pinnedLat: true,
  pinnedLng: true,
  userLat: true,
  userLng: true,
  phone: true,
  email: true,
});
