import { notification } from "antd";
import { useEffect, useState } from "react";

interface State<T> {
  data: T | null;
  loading: boolean;
}

export default function useLoading<T>(
  loader: () => Promise<T>,
  onLoaded?: ((data: T) => void) | null,
  defaultValue?: T,
) {
  const [data, setData] = useState<T | null>(defaultValue ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loader()
      .then((data) => {
        setData(data);
        onLoaded && onLoaded(data);
      })
      .catch((error) => {
        console.error(error);
        notification.error({ message: error.message });
        setData(defaultValue ?? null);
      })
      .finally(() => setLoading(false));
    return () => {
      setLoading(true);
    };
  }, [loader]);

  return {
    loading,
    data,
  };
}
