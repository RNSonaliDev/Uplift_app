import { persistAuthToken } from '../api/client';
import { pushNotificationService } from '../services/PushNotificationService';
import { VerifyOtpResponse } from '../api/auth';

export const handlePostAuthNavigation = async (
  response: VerifyOtpResponse,
  navigation: any
) => {
  const token = response.access_token || response.token;
  if (token) {
    await persistAuthToken(token);
  }

  if (response.user_exists && response.user) {
    const user = response.user;
    const pendingRoles = user.pending_roles || [];
    const selectedRoles = user.selected_roles || [];

    if (user.registration_step === 'parent_verification') {
      navigation.navigate('ParentVerification', { parentEmail: user.parent_email || '' });
      return;
    }

    if (pendingRoles.length > 0) {
      const nextRoles = [...pendingRoles];
      const nextRole = nextRoles.shift();
      const routeParams = {
        pendingRoles: nextRoles,
        selectedRoles: selectedRoles.length > 0 ? selectedRoles : pendingRoles,
        collectedRolesData: [],
      };

      if (nextRole === 'volunteer') {
        navigation.reset({ index: 0, routes: [{ name: 'VolunteerSetup', params: routeParams }] });
      } else if (nextRole === 'organization') {
        navigation.reset({ index: 0, routes: [{ name: 'OrganizationSetup', params: routeParams }] });
      } else if (nextRole === 'sponsor') {
        navigation.reset({ index: 0, routes: [{ name: 'SponsorSetup', params: routeParams }] });
      } else if (nextRole === 'beneficiary') {
        navigation.reset({ index: 0, routes: [{ name: 'BeneficiarySetup', params: routeParams }] });
      }
      return;
    }

    if (user.registration_step === 'role_setup') {
      navigation.reset({ index: 0, routes: [{ name: 'SelectRoles' }] });
      return;
    }

    if (user.default_role) {
      pushNotificationService.requestUserPermission();
      if (user.default_role === 'volunteer') {
        navigation.reset({ index: 0, routes: [{ name: 'VolunteerFlow' }] });
      } else if (user.default_role === 'sponsor') {
        navigation.reset({ index: 0, routes: [{ name: 'SponsorFlow' }] });
      } else if (user.default_role === 'organization') {
        navigation.reset({ index: 0, routes: [{ name: 'OrganizationFlow' }] });
      } else if (user.default_role === 'beneficiary') {
        navigation.reset({ index: 0, routes: [{ name: 'BeneficiaryFlow' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      }
      return;
    }

    if (selectedRoles.length > 1) {
      navigation.reset({ index: 0, routes: [{ name: 'DashboardRoleSelection', params: { selectedRoles } }] });
      return;
    }

    if (selectedRoles.length === 1) {
      const role = selectedRoles[0];
      if (role === 'volunteer') navigation.reset({ index: 0, routes: [{ name: 'VolunteerFlow' }] });
      else if (role === 'sponsor') navigation.reset({ index: 0, routes: [{ name: 'SponsorFlow' }] });
      else if (role === 'organization') navigation.reset({ index: 0, routes: [{ name: 'OrganizationFlow' }] });
      else if (role === 'beneficiary') navigation.reset({ index: 0, routes: [{ name: 'BeneficiaryFlow' }] });
      else navigation.reset({ index: 0, routes: [{ name: 'SelectRoles' }] });
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: 'SelectRoles' }] });
  } else if (response.verification_token) {
    navigation.navigate('CreateProfile', {
      verificationToken: response.verification_token,
      emailOrPhone: response.user?.email || '',
    });
  } else {
    navigation.reset({ index: 0, routes: [{ name: 'SelectRoles' }] });
  }
};
