// hoc/withAuth.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { me } from "../lib/api";

export default function withAuth(Component) {
  return function ProtectedPage(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function checkAuth() {
        try {
          await me(); // cek session ke BE
          setLoading(false);
        } catch (err) {
          console.warn("Belum login, redirect ke /login");
          router.replace("/login");
        }
      }
      checkAuth();
    }, [router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen text-gray-400">
          Memuat...
        </div>
      );
    }

    return <Component {...props} />;
  };
}
