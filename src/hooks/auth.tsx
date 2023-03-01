import Router from 'next/router';
import { useSignInMutation } from "../graphql/generated";
import { setCookie, parseCookies, destroyCookie } from 'nookies';
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
  getUser: () => any;
  isSignedIn: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export const useAuth = () => {
  return useContext(AuthContext)
};

export function signOut() {
  destroyCookie(undefined, 'auth.token')
  destroyCookie(undefined, 'auth.refreshToken')

  Router.push('/signin')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [signInUser] = useSignInMutation();

  const isSignedIn = useMemo(() => {
    const { 'auth.token': token } = parseCookies();

    return !!token
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInCredentials) => {
    try {
      const response = await signInUser({
        variables: {
          email,
          password,
        },
      });

      const { accessToken,  refreshToken, user } = response.data?.login || {};

      setCookie(undefined, 'auth.token', accessToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setCookie(undefined, 'auth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setCookie(undefined, 'user', JSON.stringify({ id: user?.id, email: user?.email, firstname: user?.firstname, lastname: user?.lastname }), {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      Router.push('/posts');
    } catch (err) {
      console.log(err);
    }
  }, [signInUser]);

  const getUser = useCallback(async () => {
    const { user } = parseCookies();

    const currentUser = user ? JSON.parse(user) : {};

    return currentUser;
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, signOut, getUser, isSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
