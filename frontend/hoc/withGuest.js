import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { me } from "../lib/api";

export default function withGuest(WrappedComponent) {
  return function WithGuest(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function check() {
        try {
          const user = await me();
          if (user) {
            router.replace("/"); // kalau sudah login → lempar ke /
          } else {
            setLoading(false);
          }
        } catch (e) {
          setLoading(false); // error (belum login) → biarin akses login/register
        }
      }
      check();
    }, [router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen text-gray-400">
          Memuat...
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
