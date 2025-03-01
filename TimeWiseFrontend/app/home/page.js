"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/account/details`);
        const userData = await response.json();
        if (userData) {
          localStorage.setItem("TimeWiseUserData", JSON.stringify(userData));
        } else {
          router.push("/welcome");
        }
      } catch (err) {
        router.push("/welcome");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* This is the root page for the home route. */}
      {/* You can add content here if needed, but it will be rendered within the layout. */}
    </div>
  );
}