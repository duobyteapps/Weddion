import {
  router,
  useLocalSearchParams,
  usePathname,
  type Href,
} from "expo-router";

type NavigationParamValue = string | number | boolean | undefined;

type PushWithReturnParams = {
  pathname: Href;
  params?: Record<string, NavigationParamValue>;
};

function normalizeParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function useAppNavigation() {
  const pathname = usePathname();
  const currentParams = useLocalSearchParams<{
    returnTo?: string | string[];
  }>();

  function push({ pathname: nextPathname, params }: PushWithReturnParams) {
    router.push({
      pathname: nextPathname as never,
      params: {
        ...params,
        returnTo: pathname,
      },
    });
  }

  function replace(pathname: Href) {
    router.replace(pathname as never);
  }

  function back(fallbackTo: Href = "/home") {
    const returnTo = normalizeParamValue(currentParams.returnTo);

    if (returnTo) {
      router.replace(returnTo as never);
      return;
    }

    router.replace(fallbackTo as never);
  }

  return {
    push,
    replace,
    back,
  };
}
