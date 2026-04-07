

-- Shpjegimi i Auth Module Flow --



# 1. How the Flow Works

- **Login:** A user signs in. The backend returns an Access Token, which lives in React memory, and sets a Refresh Token, which lives securely in a browser cookie.

- **Making Requests:** Every request to the backend includes the Access Token in the header. The backend verifies the signature, checks that it has not expired, and processes the request.

- **Expiration:** Access tokens are short-lived by design. If an attacker extracts one from memory, it will expire before it can cause damage.

- **Automatic Refresh:** When an Access Token expires, the backend returns a 401 Unauthorized. Before the code ever sees the error, the `apiClient` intercepts it, uses the secure Refresh cookie to obtain a new token, and retries the original request. The user and the code are unaffected.

- **Forced Logout:** If a user is deactivated by an admin, or the system detects a stolen refresh token being reused, the refresh fails immediately. The user is redirected to the login screen or a Security Alert page depending on the reason.



# 2. Working on the Frontend

## Making API Calls

Do not use `fetch()` or a raw `axios` instance for data requests. Always import the shared `apiClient`. It handles token injection and automatic refresh for you.

```javascript
import { apiClient } from '../lib/apiClient';

async function loadProjects() {
  const response = await apiClient.get('/api/projects');
  return response.data;
}
```


## Checking Roles for UI Elements

To show or hide elements based on the logged-in user's role, use the `useAuthorization` hook. It reads the token already held in memory, so there is no extra network request.

```javascript
import { useAuthorization } from '../hooks/useAuthorization';

function ProjectControls() {
  const { isAdmin, isFreelancer } = useAuthorization();

  return (
    <div>
      {isFreelancer && <button>Submit Proposal</button>}
      {isAdmin && <button className="text-red-500">Delete Project</button>}
    </div>
  );
}
```


## Getting Profile Data

To display the user's name, email, or role-specific data such as a Freelancer's hourly rate or a Client's industry, use the `useProfile` hook. It fetches from the backend and caches the result.

```javascript
import { useProfile } from '../hooks/useProfile';

function WelcomeHeader() {
  const { profile, isLoading } = useProfile();

  if (isLoading) return <p>Loading...</p>;
  if (!profile) return null;

  return (
    <div>
      <p>Welcome, {profile.name}</p>
      {/* Not every user has a freelancer profile, so use optional chaining */}
      <p>Your current rate: ${profile.freelancerProfile?.hourlyRate}</p>
    </div>
  );
}
```



# 3. Protecting Your Work

## Frontend Routes

When adding a new page, protect it in `App.jsx` using `ProtectedRoute`.

```jsx
// Any authenticated user
<Route element={<ProtectedRoute />}>
  <Route path="/billing" element={<BillingPage />} />
</Route>

// Specific roles only
<Route element={<ProtectedRoute requiredRoles={['Admin']} />}>
  <Route path="/system-settings" element={<SystemSettingsPage />} />
</Route>
```


## Backend Endpoints

On the .NET side, use standard ASP.NET Core attributes on your controllers or individual methods.

```csharp
// Any authenticated user
[Authorize]
[HttpGet("my-data")]
public IActionResult GetMyData() { ... }

// Admins only
[Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public IActionResult DeleteSomething() { ... }

// Public endpoint
[AllowAnonymous]
[HttpGet("public-feed")]
public IActionResult GetFeed() { ... }
```

If you run into unexpected auth errors, verify that you are using `apiClient` rather than a direct `axios` or `fetch` call.