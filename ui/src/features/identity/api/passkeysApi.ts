import { AuthResponse } from "@/features/identity/models/authResponse";
import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";
import { writeTokens } from "@/shared/session/session";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export interface Passkey {
  createdAt: string | null;
  credentialId: string;
  lastUsedAt: string | null;
  name: string;
  type: string;
}

interface CredentialCreationOptionsJson {
  challenge: string;
  excludeCredentials?: PublicKeyCredentialDescriptorJSON[];
  pubKeyCredParams: PublicKeyCredentialParameters[];
  rp: PublicKeyCredentialRpEntity;
  user: PublicKeyCredentialUserEntityJSON;
}

interface CredentialRequestOptionsJson {
  allowCredentials?: PublicKeyCredentialDescriptorJSON[];
  challenge: string;
}

interface PublicKeyCredentialDescriptorJSON {
  id: string;
  transports?: AuthenticatorTransport[];
  type: PublicKeyCredentialType;
}

interface PublicKeyCredentialUserEntityJSON {
  displayName: string;
  id: string;
  name: string;
}

const fromBase64Url = (value: string): ArrayBuffer => {
  const paddedValue = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const decoded = window.atob(paddedValue);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0)).buffer;
};

const toBase64Url = (value: ArrayBuffer): string => {
  const encoded = String.fromCharCode(...new Uint8Array(value));
  return window.btoa(encoded).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const toCredentialJson = (credential: PublicKeyCredential): Record<string, unknown> => {
  const response = credential.response;
  const common = {
    clientDataJson: toBase64Url(response.clientDataJSON),
  };
  if (response instanceof AuthenticatorAttestationResponse) {
    return {
      ...common,
      attestationObject: toBase64Url(response.attestationObject),
      transports: response.getTransports?.(),
    };
  }

  const assertion = response as AuthenticatorAssertionResponse;
  return {
    ...common,
    authenticatorData: toBase64Url(assertion.authenticatorData),
    signature: toBase64Url(assertion.signature),
    userHandle: assertion.userHandle ? toBase64Url(assertion.userHandle) : null,
  };
};

interface SerializedCredential {
  authenticatorAttachment: string | null;
  credential: Record<string, unknown>;
}

const serializeCredential = (credential: Credential): SerializedCredential => {
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("The browser did not return a passkey credential.");
  }

  return {
    authenticatorAttachment: credential.authenticatorAttachment,
    credential: {
      clientExtensionResults: credential.getClientExtensionResults(),
      id: credential.id,
      rawId: toBase64Url(credential.rawId),
      response: toCredentialJson(credential),
      type: credential.type,
    },
  };
};

const createCredential = async (options: CredentialCreationOptionsJson): Promise<SerializedCredential> => {
  const credential = await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: fromBase64Url(options.challenge),
      excludeCredentials: options.excludeCredentials?.map((credential) => ({
        ...credential,
        id: fromBase64Url(credential.id),
      })),
      user: {
        ...options.user,
        id: fromBase64Url(options.user.id),
      },
    } as PublicKeyCredentialCreationOptions,
  });
  if (!credential) {
    throw new Error("No passkey credential was created.");
  }
  return serializeCredential(credential);
};

const getCredential = async (options: CredentialRequestOptionsJson): Promise<Record<string, unknown>> => {
  const credential = await navigator.credentials.get({
    publicKey: {
      ...options,
      allowCredentials: options.allowCredentials?.map((credential) => ({
        ...credential,
        id: fromBase64Url(credential.id),
      })),
      challenge: fromBase64Url(options.challenge),
    } as PublicKeyCredentialRequestOptions,
  });
  if (!credential) {
    throw new Error("No passkey credential was selected.");
  }
  return serializeCredential(credential).credential;
};

const isPasskeyOperationCancelled = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "NotAllowedError";

export const browserSupportsPasskeys = (): boolean => "PublicKeyCredential" in window && "credentials" in navigator;

export const registerPasskey = async (name: string): Promise<boolean> => {
  try {
    const { data: options } = await axios.post<CredentialCreationOptionsJson>(
      ApiPaths.account.passkeys.registrationOptions,
    );
    const createdCredential = await createCredential(options);
    await axios.post(ApiPaths.account.passkeys.registration, { ...createdCredential, name });
    return true;
  } catch (e) {
    if (isPasskeyOperationCancelled(e)) {
      return false;
    }
    notification.error(e instanceof Error ? e.message : getApiErrorNotification(e));
    return false;
  }
};

export const signInWithPasskey = async (): Promise<boolean> => {
  try {
    const { data: options } = await axios.post<CredentialRequestOptionsJson>(
      ApiPaths.account.passkeys.authenticationOptions,
    );
    const { data } = await axios.post<AuthResponse>(
      ApiPaths.account.passkeys.authentication,
      await getCredential(options),
    );
    writeTokens(data);
    return true;
  } catch (e) {
    if (isPasskeyOperationCancelled(e)) {
      // return false;
    }
    notification.error(e instanceof Error ? e.message : getApiErrorNotification(e));
    return false;
  }
};

export const listPasskeys = async (): Promise<Passkey[]> => {
  try {
    const { data } = await axios.get<Passkey[]>(ApiPaths.account.passkeys.root);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const deletePasskey = async (credentialId: string): Promise<boolean> => {
  try {
    await axios.delete(`${ApiPaths.account.passkeys.root}/${encodeURIComponent(credentialId)}`);
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};
