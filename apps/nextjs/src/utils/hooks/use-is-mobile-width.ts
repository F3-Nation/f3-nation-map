import { useWindowSize } from "@react-hook/window-size";

export const useIsMobileWidth = () => {
  const [width] = useWindowSize();
  return {
    isMobileWidth: width < 1024,
    isDesktopWidth: width > 1024,
  };
};
