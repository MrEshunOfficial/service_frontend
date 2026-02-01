# Client Profile Form - Integration Examples

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [With Existing Profile Data](#with-existing-profile-data)
3. [Modal/Dialog Integration](#modaldialog-integration)
4. [Custom Validation](#custom-validation)
5. [API Integration](#api-integration)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Basic Usage

### Simple Implementation

```tsx
import { ClientProfileForm } from "@/components/client-profile";

export default function CreateProfilePage() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <ClientProfileForm 
        onSuccess={() => console.log("Success!")}
        onCancel={() => window.history.back()}
      />
    </div>
  );
}
```

### With Router Navigation

```tsx
"use client";

import { useRouter } from "next/navigation";
import { ClientProfileForm } from "@/components/client-profile";

export default function CreateProfilePage() {
  const router = useRouter();

  return (
    <ClientProfileForm 
      onSuccess={() => router.push("/dashboard")}
      onCancel={() => router.back()}
    />
  );
}
```

---

## With Existing Profile Data

### Edit Mode

```tsx
"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { ClientProfileForm } from "@/components/client-profile";
import { useClientProfile } from "@/hooks/useClientProfile";

export default function EditProfilePage() {
  const { profile, loading } = useClientProfile();
  const methods = useForm();

  // Pre-fill form with existing data
  useEffect(() => {
    if (profile) {
      methods.reset({
        preferredName: profile.preferredName,
        dateOfBirth: profile.dateOfBirth,
        clientContactInfo: profile.clientContactInfo,
        savedAddresses: profile.savedAddresses,
        preferences: profile.preferences,
        emergencyContact: profile.emergencyContact,
      });
    }
  }, [profile, methods]);

  if (loading) return <LoadingSpinner />;

  return (
    <FormProvider {...methods}>
      <ClientProfileForm 
        onSuccess={() => router.push("/profile")}
      />
    </FormProvider>
  );
}
```

---

## Modal/Dialog Integration

### Using Shadcn Dialog

```tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientProfileForm } from "@/components/client-profile";

export function ProfileFormDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Create Profile
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Your Profile</DialogTitle>
            <DialogDescription>
              Complete your profile to start booking services
            </DialogDescription>
          </DialogHeader>
          
          <ClientProfileForm 
            onSuccess={() => {
              setOpen(false);
              // Handle success
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## Custom Validation

### Adding Custom Validation Rules

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Extend the base schema
const customProfileSchema = clientProfileFormSchema.extend({
  preferredName: z.string()
    .min(2, "Name too short")
    .max(50, "Name too long")
    .refine((name) => !name.includes("@"), {
      message: "Name cannot contain @ symbol",
    }),
  
  clientContactInfo: z.object({
    emailAddress: z.string()
      .email()
      .refine(async (email) => {
        // Check if email is already in use
        const response = await fetch(`/api/check-email?email=${email}`);
        const data = await response.json();
        return !data.exists;
      }, {
        message: "Email already in use",
      }),
  }).optional(),
});

// Use in form
const methods = useForm({
  resolver: zodResolver(customProfileSchema),
});
```

### Conditional Validation

```tsx
const conditionalSchema = z.object({
  preferredName: z.string().min(2),
  dateOfBirth: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phoneNumber: z.string(),
  }).refine((contact) => {
    // Require emergency contact if user is under 18
    const age = calculateAge(formData.dateOfBirth);
    return age >= 18 || (contact.name && contact.phoneNumber);
  }, {
    message: "Emergency contact required for users under 18",
  }),
});
```

---

## API Integration

### Complete Integration Example

```tsx
"use client";

import { useState } from "react";
import { ClientProfileForm } from "@/components/client-profile";
import { useClientProfile } from "@/hooks/useClientProfile";
import { toast } from "sonner";

export default function ProfileCreationFlow() {
  const { createProfile, loading, error } = useClientProfile(false);
  const [createdProfile, setCreatedProfile] = useState(null);

  const handleSuccess = async () => {
    try {
      // Perform any post-creation actions
      await fetch("/api/analytics/profile-created", {
        method: "POST",
        body: JSON.stringify({ profileId: createdProfile?._id }),
      });

      // Show success toast
      toast.success("Profile created successfully!");

      // Redirect to onboarding
      router.push("/onboarding/welcome");
    } catch (error) {
      console.error("Post-creation error:", error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <ClientProfileForm 
        onSuccess={handleSuccess}
        onCancel={() => router.push("/")}
      />
    </div>
  );
}
```

### With Custom API Endpoint

```tsx
import { ClientProfileForm } from "@/components/client-profile";

export default function CustomAPIProfile() {
  const handleSubmit = async (data: ClientProfileFormData) => {
    try {
      const response = await fetch("/api/v2/profiles/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create profile");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  return (
    <ClientProfileForm 
      onSuccess={() => console.log("Done!")}
    />
  );
}
```

---

## Error Handling

### Comprehensive Error Handling

```tsx
"use client";

import { useState } from "react";
import { ClientProfileForm } from "@/components/client-profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ProfileWithErrorHandling() {
  const [errors, setErrors] = useState<string[]>([]);

  const handleError = (error: any) => {
    if (error.response?.data?.errors) {
      // API validation errors
      const apiErrors = error.response.data.errors.map(
        (err: any) => err.message
      );
      setErrors(apiErrors);
    } else if (error.message) {
      // General error
      setErrors([error.message]);
    } else {
      setErrors(["An unexpected error occurred"]);
    }

    // Scroll to top to show errors
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <ClientProfileForm 
        onSuccess={() => setErrors([])}
      />
    </div>
  );
}
```

---

## Testing

### Unit Test Example

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientProfileForm } from "@/components/client-profile";

describe("ClientProfileForm", () => {
  it("renders all form steps", () => {
    render(<ClientProfileForm />);
    
    expect(screen.getByText("Personal Info")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Preferences")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<ClientProfileForm />);

    // Try to proceed without filling required fields
    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it("calls onSuccess when form is submitted", async () => {
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    
    render(<ClientProfileForm onSuccess={onSuccess} />);

    // Fill out form...
    // Navigate through steps...
    // Submit form...

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

### Integration Test Example

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { ClientProfileForm } from "@/components/client-profile";

const server = setupServer(
  rest.post("/api/profiles/client", (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ClientProfileForm Integration", () => {
  it("successfully creates profile with API", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    render(<ClientProfileForm onSuccess={onSuccess} />);

    // Fill personal info
    await user.type(
      screen.getByLabelText(/preferred name/i),
      "John Doe"
    );

    // Navigate and fill other steps...

    // Submit
    const submitButton = screen.getByRole("button", { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

---

## Advanced Patterns

### Multi-Tenant Support

```tsx
import { ClientProfileForm } from "@/components/client-profile";
import { useOrganization } from "@/hooks/useOrganization";

export default function TenantProfileForm() {
  const { organizationId } = useOrganization();

  const handleSuccess = async (profile: ClientProfile) => {
    // Associate profile with organization
    await fetch(`/api/organizations/${organizationId}/clients`, {
      method: "POST",
      body: JSON.stringify({ clientId: profile._id }),
    });
  };

  return <ClientProfileForm onSuccess={handleSuccess} />;
}
```

### Analytics Tracking

```tsx
import { useEffect } from "react";
import { ClientProfileForm } from "@/components/client-profile";
import { analytics } from "@/lib/analytics";

export default function TrackedProfileForm() {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    analytics.track("profile_form_step_viewed", {
      step: currentStep,
      stepName: STEPS[currentStep - 1].name,
    });
  }, [currentStep]);

  return (
    <ClientProfileForm 
      onSuccess={() => {
        analytics.track("profile_created");
      }}
    />
  );
}
```
