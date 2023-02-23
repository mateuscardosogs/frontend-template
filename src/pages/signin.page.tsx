import { FormEvent, useCallback, useState } from 'react';
import { useAuth } from "@/hooks/auth"

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useAuth();

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();

    const data = { email,  password }

    await signIn(data);
    },
    [signIn]
  );

  return (
    <>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" value={email}  required onChange={e => setEmail(e.target.value)} />
        <input name="password" type="password" value={password} required onChange={e => setPassword(e.target.value)} />
        <button type="submit">Sign in</button>
        <a href="/signup">Sign up</a>
      </form>
    </>
  );
};
