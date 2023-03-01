import { useRouter } from 'next/router';
import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/auth";

export default function Home() {
  const router = useRouter();
  const { signOut, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) router.push('/signin');
  }, [isSignedIn]);

  return (
    <div>
      <a href="/posts">posts</a>{' '}  page. or{' '}
      <button onClick={signOut}>Sign out</button>
    </div>
  )
};
