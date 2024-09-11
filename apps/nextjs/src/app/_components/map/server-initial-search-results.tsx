"use server";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { api } from "~/trpc/server";
import SearchResultItem from "./search-result-item";

export const ServerInitialSearchResults = async () => {
  RERENDER_LOGS && console.log("DrawerSearchResults rerender");

  const previewLocations = await api.location.getPreviewLocations();
  return previewLocations
    ?.slice(0, 10)
    .map((result) => (
      <SearchResultItem key={result.id} searchResult={result} />
    ));
};
