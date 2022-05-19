import React, { useEffect, useRef } from 'react';

import { useGoogleOAuth } from './GoogleOAuthProvider';
import {
  IdConfiguration,
  CredentialResponse,
  MomenListener,
  GsiButtonConfiguration,
} from './types';

const containerHeightMap = { large: 40, medium: 32, small: 20 };

export type GoogleLoginProps = {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: () => void;
  promptMomentNotification?: MomenListener;
  useOneTap?: boolean;
} & Omit<IdConfiguration, 'client_id' | 'callback'> &
  GsiButtonConfiguration;

export default function GoogleLogin({
  onSuccess,
  onError,
  useOneTap,
  promptMomentNotification,
  type = 'standard',
  theme = 'outline',
  size = 'large',
  text,
  shape,
  logo_alignment,
  width,
  locale,
  ...props
}: GoogleLoginProps) {
  const btnContainerRef = useRef<HTMLDivElement>(null);
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const promptMomentNotificationRef = useRef(promptMomentNotification);
  promptMomentNotificationRef.current = promptMomentNotification;

  useEffect(() => {
    if (!scriptLoadedSuccessfully) return;

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.clientId || !credentialResponse.credential) {
          return onErrorRef.current?.();
        }

        onSuccessRef.current(credentialResponse);
      },
      ...props,
    });

    window.google?.accounts.id.renderButton(btnContainerRef.current!, {
      type,
      theme,
      size,
      text,
      shape,
      logo_alignment,
      width,
      locale,
    });

    if (useOneTap)
      window.google?.accounts.id.prompt(promptMomentNotificationRef.current);

    return () => {
      if (useOneTap) window.google?.accounts.id.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clientId,
    scriptLoadedSuccessfully,
    useOneTap,
    type,
    theme,
    size,
    text,
    shape,
    logo_alignment,
    width,
    locale,
  ]);

  return (
    <div
      ref={btnContainerRef}
      style={{ display: 'inline-flex', height: containerHeightMap[size] }}
    />
  );
}
