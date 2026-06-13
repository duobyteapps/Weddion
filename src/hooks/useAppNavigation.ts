import {
    router,
    useLocalSearchParams,
    usePathname,
    type Href,
} from "expo-router";

type PushWithReturnParams = {
  pathname: Href;
  params?: Record<string, string | number | boolean | undefined>;
};

export function useAppNavigation() {
  const pathname = usePathname();
  const currentParams = useLocalSearchParams();

  function push({ pathname: nextPathname, params }: PushWithReturnParams) {
    router.push({
      pathname: nextPathname,
      params: {
        ...params,
        returnTo: pathname,
      },
    });
  }

  function replace(pathname: Href) {
    router.replace(pathname);
  }

  function back(fallbackTo: Href = "/home") {
    const returnTo = currentParams.returnTo;

    if (typeof returnTo === "string" && returnTo.length > 0) {
      router.replace(returnTo as Href);
      return;
    }

    router.replace(fallbackTo);
  }

  return {
    push,
    replace,
    back,
  };
}
