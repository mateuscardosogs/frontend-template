import { useRouter } from 'next/router';
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";

export default function Home() {
  const router = useRouter();
  const { user, signOut, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) router.push('/signin');
  }, [isSignedIn]);

  return (
    <div>
      You're signed in as {user?.email} goto{' '}
      <a href="/posts">posts</a>{' '}  page. or{' '}
      <button onClick={signOut}>Sign out</button>
    </div>
  )
};
