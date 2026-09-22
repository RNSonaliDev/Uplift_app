import { Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  User as GoogleUser,
} from '@react-native-google-signin/google-signin';
import appleAuth, {
  AppleRequestResponse,
} from '@invertase/react-native-apple-authentication';

export interface SocialAuthResult {
  provider: 'google' | 'apple';
  idToken: string;
  accessToken?: string;
  authorizationCode?: string;
  user: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export const DEFAULT_GOOGLE_WEB_CLIENT_ID = '49775382219-5ppt7qivr96i0su6v54neaqnjhq69jlq.apps.googleusercontent.com';

class SocialAuthService {
  private isGoogleConfigured = false;

  public configureGoogle(webClientId: string = DEFAULT_GOOGLE_WEB_CLIENT_ID, iosClientId?: string) {
    if (this.isGoogleConfigured) return;
    
    GoogleSignin.configure({
      webClientId,
      iosClientId: iosClientId || webClientId,
      offlineAccess: true,
      scopes: ['profile', 'email'],
    });
    this.isGoogleConfigured = true;
  }

  public async signInWithGoogle(): Promise<SocialAuthResult> {
    try {
      this.configureGoogle();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      const response = await GoogleSignin.signIn();
      
      let idToken: string | null = null;
      let email: string | undefined;
      let firstName: string | undefined;
      let lastName: string | undefined;

      // Handle google sign-in response structure (v10+ vs v16+)
      if (response && 'data' in response && response.data) {
        const data = response.data;
        idToken = data.idToken;
        email = data.user.email || undefined;
        firstName = data.user.givenName || undefined;
        lastName = data.user.familyName || undefined;
      } else if (response && 'idToken' in response) {
        const legacyResponse = response as unknown as GoogleUser;
        idToken = legacyResponse.idToken;
        email = legacyResponse.user.email || undefined;
        firstName = legacyResponse.user.givenName || undefined;
        lastName = legacyResponse.user.familyName || undefined;
      }

      if (!idToken) {
        // Fallback: fetch tokens manually if needed
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
      }

      if (!idToken) {
        throw new Error('Could not retrieve Google ID Token.');
      }

      return {
        provider: 'google',
        idToken,
        user: {
          email,
          firstName,
          lastName,
        },
      };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('CANCELLED');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services is not available or outdated');
      } else {
        throw error;
      }
    }
  }

  public async signInWithApple(): Promise<SocialAuthResult> {
    if (!appleAuth.isSupported) {
      throw new Error('Sign in with Apple is only supported on iOS devices (iOS 13+).');
    }

    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, authorizationCode, fullName, email } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('Apple Sign In failed - no identity token received.');
      }

      const firstName = fullName?.givenName || undefined;
      const lastName = fullName?.familyName || undefined;

      return {
        provider: 'apple',
        idToken: identityToken,
        authorizationCode: authorizationCode || undefined,
        user: {
          email: email || undefined,
          firstName,
          lastName,
        },
      };
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
        throw new Error('CANCELLED');
      } else {
        throw error;
      }
    }
  }

  public isAppleAuthSupported(): boolean {
    return appleAuth.isSupported;
  }
}

export const socialAuthService = new SocialAuthService();
