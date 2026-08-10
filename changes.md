**AI Agent Task: Modify User Registration PIN Handling**

Update the user registration process to allow users to create their own PIN instead of using a system-generated PIN.

## 1. Remove Generated PIN Logic

Modify the registration workflow to remove the existing behavior where the application:

* Automatically generates a random 2-digit PIN.
* Sends the generated PIN to the user by email.
* Uses the generated PIN for future logins.

Remove all code, database fields, validation logic, and email content specifically related to the generated 2-digit PIN.

## 2. User-Created 4-Digit PIN

During registration, require the user to create their own PIN.

### Registration Form Requirements

Add a required field:

* **4-Digit PIN**

The user must:

* Enter exactly 4 numeric digits.
* Confirm the PIN by entering it a second time.
* Receive an error message if:

  * The PIN is not exactly 4 digits.
  * The PIN contains non-numeric characters.
  * The confirmation PIN does not match.

Example:

```
Create PIN:        [1234]
Confirm PIN:       [1234]
```

## 3. Store PIN Securely

When registration is completed:

* Store the user-created 4-digit PIN on the server.
* Associate the PIN with the user's email account.
* Store the PIN securely using appropriate protection methods.
* Do not store PIN values in client-side storage.

## 4. Email Verification

Keep the existing email verification process unchanged except:

* Remove the generated PIN from the verification email.
* The email should only confirm that the user's email address is valid.
* The verification link/button should continue to activate the account.

## 5. Login Changes

Update login behavior:

Users should log in using:

* Email address
* Their self-created 4-digit PIN

Remove any assumptions that the PIN is:

* Two digits.
* Automatically generated.
* Sent by the system.

## 6. Forgot PIN Functionality

Update the Forgot PIN workflow:

When a user requests a forgotten PIN:

1. Verify the email address exists.
2. Generate a secure PIN reset process.
3. Allow the user to create a new 4-digit PIN.
4. Store the new PIN on the server.
5. Allow the user to log in using the new PIN.

Do not email the PIN in plain text unless the existing security design explicitly requires it.

## 7. Preserve Existing Application Behavior

Do not modify any other functionality.

Keep unchanged:

* Welcome screen.
* Registration flow.
* Email verification.
* Login process structure.
* User roles.
* Student/instructor/administrator permissions.
* Progress tracking.
* Server-side storage.
* Instructor and administrator features.
* All educational content and Fun Zone activities.

The only modification should be replacing the **system-generated 2-digit registration PIN** with a **user-created 4-digit PIN**, while keeping the rest of the application unchanged.
