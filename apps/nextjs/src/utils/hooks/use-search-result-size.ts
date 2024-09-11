import { useWindowSize } from "@react-hook/window-size";

export const useSearchResultSize = () => {
  const [width] = useWindowSize();
  const itemGap = 16;
  const itemWidth = (width * 4) / 5;
  // to allow the item to be in the center
  const scrollBuffer = (width - itemWidth - itemGap) / 2;
  return { itemWidth, itemGap, scrollBuffer };
};