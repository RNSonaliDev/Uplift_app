import { persistAuthToken } from '../api/client';
import { pushNotificationService } from '../services/PushNotificationService';
import { VerifyOtpResponse } from '../api/auth';

export const handlePostAuthNavigation = async (
  response: VerifyOtpResponse,
  navigation: any,
  result?: any,
) => {
  const token = response.access_token || response.token || response.verification_token;
  console.log("@@@@@@@@@@@@response", response)
  console.log("@@@@@@@@@@@@result", result.user)
  if (token) {
    await persistAuthToken(token);
  }

  const registrationStep = response.user?.registration_step || (response as any).registration_step;

  if (response.user_exists && response.user) {
    const user = response.user;
    const pendingRoles = user.pending_roles || [];
    const selectedRoles = user.selected_roles || [];

    if (user.registration_step === 'parent_verification') {
      navigation.navigate('ParentVerification', { parentEmail: user.parent_email || '' });
      return;
    }

    if (user.registration_step === 'basic_profile') {
      navigation.navigate('CreateProfile', {
        verificationToken: response.verification_token || token || '',
        email: result?.user?.email,
        firstName: result?.user?.firstName || '',
        lastName: result?.user?.lastName || '',
      });
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
  } else if (registrationStep === 'basic_profile' || response.verification_token) {
    navigation.navigate('CreateProfile', {
      verificationToken: response.verification_token || token || '',
      email: result.user?.email || response.user?.phone || (response as any)?.email || '',
      firstName: result.user?.firstName || (response as any)?.first_name || '',
      lastName: result.user?.lastName || (response as any)?.last_name || '',
    });
  } else {
    navigation.reset({ index: 0, routes: [{ name: 'SelectRoles' }] });
  }
};
