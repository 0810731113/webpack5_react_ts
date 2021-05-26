import { useRequest } from "@umijs/hooks";
import { UserVO } from "api/generated/model";
import { useEffect } from "react";
import { userService } from "service";

export function useMe() {
  const { data, loading, run } = useRequest(
    () => userService
        .me()
        .then((user) => user || ({ name: "error", telephone: "" } as UserVO))
        .catch((err) => ({ name: "error", telephone: "" } as UserVO)),
    {
      manual: true,
    },
  );

  useEffect(() => {
    run();
  }, []);

  return {
    user: data,
    loading,
    run,
  };
}
