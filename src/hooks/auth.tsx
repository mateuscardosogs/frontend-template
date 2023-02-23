import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { useSignInMutation, useCurrentUserQuery } from "../graphql/generated";
import React, { useContext, createContext, ReactNode, useEffect, useState, useMemo, useCallback } from 'react';

type User = {
  email: string;
  firstname: string;
  lastname: string;
  role: string;
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isSignedIn: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export const useAuth = () => {
  return useContext(AuthContext)
};

export function signOut() {
  destroyCookie(undefined, 'auth.token')
  destroyCookie(undefined, 'auth.refreshToken')

  authChannel.postMessage('signOut');

  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);

  const isSignedIn = useMemo(() => Object.keys(user).length > 0, [user]);

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        default:
          break;
      }
    }
  }, []);

  useEffect(() => {
    const { 'auth.token': token } = parseCookies();

    if (token) {
      try {
        const { data } = useCurrentUserQuery({  fetchPolicy: 'network-only' });

        const { email, firstname, lastname, role } = data?.me as User;

        setUser({ email, firstname, lastname, role });
      } catch (err) {
        signOut();
      }
    }
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInCredentials) => {
    try {
      const [signInUser] = useSignInMutation();

      const response = await signInUser({
        variables: {
          email,
          password,
        },
      });

      const { accessToken,  refreshToken, user } = response.data?.login || {};
      const { firstname, lastname, role } = user as User;

      setCookie(undefined, 'auth.token', accessToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setCookie(undefined, 'auth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setUser({
        email,
        firstname,
        lastname,
        role
      })

      Router.push('/posts');
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, signOut, isSignedIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}
