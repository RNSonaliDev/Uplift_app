# Uplift App API Documentation

This document outlines the proposed RESTful API contracts required to support the onboarding and profile setup flows in the Uplift app. 

> [!NOTE]
> All requests should include a standard `Authorization: Bearer <token>` header once the user is authenticated (after account creation/login).

---

## 1. Authentication & Base Account

### 1.1 Create Account
Creates the initial user account with basic credentials.
- **Endpoint**: `POST /api/v1/auth/register`
- **Screen**: `CreateAccountScreen`

**Request Payload:**
```json
{
  "identifier": "john.doe@example.com", // Email or Phone number
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "userId": "usr_12345",
  "status": "pending_verification",
  "message": "Verification code sent."
}
```

### 1.2 Verify Account (OTP)
Verifies the user's email or phone number using a 4-digit code.
- **Endpoint**: `POST /api/v1/auth/verify`
- **Screen**: `VerifyAccountScreen`

**Request Payload:**
```json
{
  "identifier": "john.doe@example.com",
  "code": "1234"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "dGVzdF9yZWZyZXNo...",
  "userId": "usr_12345",
  "verified": true
}
```

---

## 2. Role Selection

### 2.1 Set User Roles
Updates the user's account with their selected platform roles.
- **Endpoint**: `PUT /api/v1/users/me/roles`
- **Screen**: `SelectRolesScreen`

**Request Payload:**
```json
{
  "roles": ["volunteer", "sponsor"] // Array of selected role strings
}
```

**Response (200 OK):**
```json
{
  "userId": "usr_12345",
  "roles": ["volunteer", "sponsor"],
  "profilesPendingSetup": ["volunteer", "sponsor"]
}
```

---

## 3. Profile Setup

> [!IMPORTANT]
> The following endpoints require the user to be authenticated. The `userId` is inferred from the Bearer token.

### 3.1 Sponsor Setup
Saves the specific profile details for a Sponsor role.
- **Endpoint**: `POST /api/v1/users/me/profiles/sponsor`
- **Screen**: `SponsorSetupScreen`

**Request Payload:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "anonymityPreference": "show" // or "hide"
}
```

**Response (201 Created):**
```json
{
  "profileId": "spn_9876",
  "status": "active"
}
```

### 3.2 Volunteer Setup
Saves the specific profile details for a Volunteer role.
- **Endpoint**: `POST /api/v1/users/me/profiles/volunteer`
- **Screen**: `VolunteerSetupScreen`

**Request Payload:**
```json
{
  "firstName": "Michael",
  "lastName": "Scott",
  "phoneNumber": "2015550123",
  "zipCode": "10001",
  "categories": ["food_delivery", "mentoring"],
  "hoursPerWeek": 5, // Optional
  "radiusWithin": 20, // Miles
  "radiusOutside": 10 // Miles
}
```
*Note: Profile photo upload should be handled via a separate multipart/form-data upload endpoint that returns a media URL to be included here, or sent directly as form-data to this endpoint.*

**Response (201 Created):**
```json
{
  "profileId": "vol_4567",
  "status": "active"
}
```

### 3.3 Beneficiary Setup
Saves the specific profile details for a Beneficiary role.
- **Endpoint**: `POST /api/v1/users/me/profiles/beneficiary`
- **Screen**: `BeneficiarySetupScreen`

**Request Payload:**
```json
{
  "firstName": "Sarah",
  "lastName": "Connor",
  "phoneNumber": "2015550999",
  "dateOfBirth": "1985-05-12", // Format: YYYY-MM-DD
  "zipCode": "90210",
  "additionalNotes": "Requires wheelchair accessible delivery." // Optional
}
```

**Response (201 Created):**
```json
{
  "profileId": "ben_1122",
  "status": "active"
}
```

### 3.4 Organization Setup
Saves the specific profile details for an Organization role.
- **Endpoint**: `POST /api/v1/users/me/profiles/organization`
- **Screen**: `OrganizationSetupScreen`

**Request Payload:**
```json
{
  "organizationType": "non_profit", 
  "organizationName": "Community Helpers Inc.",
  "organizationAddress": "123 Main St, Springfield",
  "contactName": "John Doe",
  "contactEmail": "contact@communityhelpers.org",
  "contactPhone": "5551234567"
}
```

**Response (201 Created):**
```json
{
  "profileId": "org_7788",
  "status": "pending_verification"
}
```

---

## 4. Status Check

### 4.1 Get Profile Setup Status
Retrieves the overall status of the user's account to populate the Success screen or route them on app launch.
- **Endpoint**: `GET /api/v1/users/me/status`
- **Screen**: `SuccessScreen` (or routing layer)

**Response (200 OK):**
```json
{
  "userId": "usr_12345",
  "accountVerified": true,
  "selectedRoles": ["volunteer"],
  "completedProfiles": ["volunteer"],
  "pendingProfiles": [],
  "isSetupComplete": true
}
```
