**AI Agent Task: Implement Authentication, User Roles, and Progress Management**

Implement a complete authentication, authorization, and user management system for the application. This feature should include user registration, email verification, persistent login, role-based access control, instructor/student relationships, progress synchronization, and administrative tools.

---

# 1. Welcome Screen

The application should no longer open directly to the main interface.

Instead, display a **Welcome Screen** with two options:

* **Register**
* **Login**

Users must authenticate before accessing the application.

---

# 2. User Registration

If the user is not already registered, they must register by providing:

* First name
* Last name
* Valid email address

Validate all required fields before allowing registration.

---

# 3. Email Verification

After registration:

1. Generate a random **2-digit numeric PIN**.
2. Send a verification email to the supplied email address.
3. The email must include:

   * A welcome message.
   * The user's randomly generated PIN (used for future logins).
   * A **Verify Email** button/link.
4. The account should remain in a **Pending Verification** state until the verification link is activated.
5. Only verified users may log in.

---

# 4. Login

After registration, all future visits begin at the Welcome Screen.

Users log in using:

* Email address
* 2-digit PIN

Provide:

* Remember Me option.
* Forgot PIN option.

---

# 5. Forgot PIN

If the user selects **Forgot PIN**:

* Verify the email exists.
* Send the current PIN to the registered email address.
* Do not generate a new PIN unless a future password reset feature is implemented.

---

# 6. Persistent Login

After a successful login:

* Store authentication credentials securely.
* Automatically bypass the Welcome Screen on future visits until the user explicitly logs out.
* Never store credentials in plain text.

---

# 7. User Roles

Implement three roles:

## Student

Default role for new registrations.

Permissions:

* Coordinate Systems
* Projectile Motion
* Motion Diagrams
* Relative Motion
* Uniform Circular Motion

Students **cannot** access:

* Instructor Tab
* Administrator Tab

---

## Instructor

Permissions:

* First five instructional tabs.
* Instructor Tab.

No Administrator privileges.

---

## Administrator

Administrators inherit all Instructor permissions.

Administrators may access:

* First five instructional tabs.
* Instructor Tab.
* Administrator Tab.

---

# 8. Initial Administrator

When the application contains no users:

* The first successfully verified registration becomes an **Administrator**.

Every registration afterward becomes a **Student** by default.

---

# 9. Display Logged-in User

After login, display the user's:

**First Name Last Name**

at the top of every page in the main application.

---

# 10. Student Instructor Assignment

Students cannot use the application until an instructor has been selected.

Requirements:

* Display an Instructor selection list immediately after login if none has been selected.
* Disable all instructional activities until an instructor is chosen.
* Save the selected instructor.
* Allow the student to change instructors later if permitted by application policy.

Display instructors sorted:

* Last Name
* First Name

Administrators should also appear in this list because administrators are instructors.

---

# 11. Student Progress

Record student progress:

### Locally

Store progress on the client computer.

### Server

Synchronize the same progress to the server.

Both copies should remain synchronized.

---

# 12. Cross-Device Synchronization

When a user logs in on another computer:

1. Authenticate normally.
2. Download the user's progress from the server.
3. Store it locally.
4. Continue synchronizing future updates.

If local and server copies differ, use the server copy as the authoritative source unless conflict resolution is implemented.

---

# 13. Instructor Dashboard

Create an Instructor tab.

Instructors may:

* View all assigned students.
* View each student's progress.
* Monitor completion of activities.
* Review scores and progress statistics.

Students should be displayed alphabetically by:

* Last Name
* First Name

---

# 14. Administrator Instructor View

Administrators may:

* Select any instructor.
* View that instructor's assigned students.
* Review the progress of those students.

Administrators should also appear in the instructor list.

Sort instructors:

* Last Name
* First Name

---

# 15. Administrator Dashboard

Create an Administrator tab with the following capabilities.

## User Lists

Display separate lists for:

* Administrators
* Instructors
* Students

Each list sorted:

* Last Name
* First Name

---

## Role Management

Administrators may:

Promote:

* Student → Instructor
* Student → Administrator
* Instructor → Administrator

Demote:

* Administrator → Instructor
* Instructor → Student
* Administrator → Student

Restrictions:

* Administrators **cannot demote themselves**.
* The system must always contain **at least one Administrator**.
* Prevent any action that would leave the application without an Administrator.

---

## User Deletion

Administrators may delete:

* Students
* Instructors
* Administrators (except themselves)

Restrictions:

* Users cannot delete themselves.
* Deleting the final remaining Administrator is prohibited.

---

# 16. Reset Application

Provide a **Reset Application** button available only to Administrators.

When activated:

Delete:

* All student registrations.
* All student progress data.
* All student activity history.

Preserve:

* Administrator accounts.
* Instructor accounts.
* Instructor progress.
* Administrator progress.
* Role assignments for instructors and administrators.

Require a confirmation dialog before executing the reset.

---

# 17. Security Requirements

Implement secure authentication and authorization.

Requirements:

* Validate all server requests.
* Enforce role-based authorization on both the client and server.
* Prevent privilege escalation.
* Never trust client-side role information.
* Store authentication credentials securely (never in plain text).
* Protect all authenticated endpoints.
* Validate email ownership before activating an account.

---

# 18. User Experience

* Keep the login and registration workflow simple and intuitive.
* Provide clear validation and error messages.
* Display loading indicators during authentication and synchronization.
* Confirm successful registration, email verification, login, logout, and password/PIN recovery.
* Ensure all role transitions and administrative actions update the user interface immediately.

---

# 19. Preserve Existing Functionality

Do not modify any instructional content, games, scoring systems, animations, or educational activities except where necessary to integrate authentication, authorization, user roles, progress synchronization, and administrative features. The new authentication and role-management system should integrate seamlessly with the existing application while preserving all current functionality.
