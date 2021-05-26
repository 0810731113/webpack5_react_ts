import { useRequest } from "@umijs/hooks";
import { useEffect } from "react";
import { specialtyService } from "service";

export default function useProjectSpecialtyList(projectId: string) {
  const { data, loading, run } = useRequest(
    () => specialtyService
        .querySepcialty(projectId)
        .then((specialties) => specialties || []),
    {
      manual: true,
    },
  );

  useEffect(() => {
    run();
  }, [projectId]);

  return {
    specialties: data,
    loading,
    run,
  };
}
