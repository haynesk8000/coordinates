# AI Agent Task: Update Welcome Screen and Login Flow

Modify the application startup and authentication flow so that the **Welcome screen is always displayed before the main application**.

## 1. Always Display the Welcome Screen

Whenever the application is launched or the site is revisited:

* Display the **Welcome screen first**.
* Do not automatically bypass the Welcome screen based solely on a previous login session.
* The Welcome screen must contain the existing **Register** and **Login** buttons at the bottom of the screen.
* Do not automatically navigate directly to the main application on page load.

## 2. Login Button Behavior

When the user clicks **Login**:

### Previously Authenticated User

If the user has a valid existing authenticated session:

* Recognize the existing session.
* Do **not** require the user to enter their email and PIN again.
* Proceed directly to the main application.
* Restore the user's authenticated state and appropriate permissions.

### User Without a Valid Session

If the user does not have a valid existing session:

* Display the existing login form.
* Require the user to authenticate using their email and PIN.
* If authentication succeeds, proceed to the main application.
* If authentication fails, display the appropriate error message and remain on the login screen.

## 3. Register Button

When the user clicks **Register**:

* Display the existing registration workflow.
* Preserve all existing registration, email verification, PIN creation, and account setup functionality.
* After successful registration and verification, allow the user to proceed to the main application according to the existing authentication rules.

## 4. Welcome Screen Images

Replace the current single Welcome screen image with a randomly selected image from the:

`Welcome_images`

directory.

### Requirements

* At application startup, randomly select **one image** from the `Welcome_images` directory.
* Display the selected image on the Welcome screen.
* Each time the Welcome screen is loaded as a new application session, randomly select an image again.
* Do not hard-code a specific image.
* Automatically include any valid image files added to the `Welcome_images` directory without requiring code changes, if the application's build/runtime architecture supports directory discovery.
* If directory discovery is not possible in the current frontend architecture, implement the image selection using the project's existing asset-management approach.

## 5. Preserve Existing Functionality

Do not modify:

* Registration requirements.
* Email verification.
* PIN authentication.
* Forgot PIN functionality.
* User roles and permissions.
* Student/instructor/administrator functionality.
* Server-side authentication.
* Server-side progress tracking.
* Main application content.
* Existing Welcome screen design except for the image-selection change.

The primary changes are:

1. **Always show the Welcome screen first.**
2. **Keep Register and Login buttons at the bottom of the Welcome screen.**
3. **Allow users with a valid existing session to bypass re-entering their credentials after clicking Login.**
4. **Require unauthenticated users to log in or register.**
5. **Randomly select the Welcome screen image from `Welcome_images`.**
