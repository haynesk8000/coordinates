# Simplify User Login and Remove Role-Based Identification

## 1. Objective

Simplify the application's login and user management functionality by eliminating instructor selection during initial login and removing visible user role labels.

Going forward, **all users must be treated as students**, regardless of any previously assigned roles.

Preserve all existing application functionality unrelated to these changes.

## 2. Functional Requirements

### 2.1 Remove Instructor Selection During Initial Login

- Eliminate the requirement for users to select or identify an instructor during their initial login.
- Remove the instructor selection field, dropdown, or associated interface elements from the initial login and onboarding process.
- Do not require an instructor assignment to create a user account or access the application.
- Remove validation rules that require an instructor to be selected.
- Ensure users can complete initial login without providing instructor information.

### 2.2 Remove User Role Labels

Currently, the application displays a role label to the right of the user's name, such as:

- Student
- Instructor
- Administrator

**Remove these labels entirely from the user interface.**

Requirements:

- Continue displaying the user's name in its existing location.
- Do not display any role designation next to the user's name.
- Remove any associated spacing, separators, or styling that becomes unnecessary.
- Apply this change consistently throughout the application wherever these role labels appear.

### 2.3 Treat All Users as Students

Eliminate role-based distinctions between Student, Instructor, and Administrator.

Requirements:

1. Treat every authenticated user as a student.
2. Do not ask users to select or specify a role.
3. Ensure all users receive the standard student experience.
4. Remove role-based navigation and interface differences that are no longer applicable.
5. Use student-specific functionality as the default for every user.
6. Ensure existing accounts previously designated as Instructor or Administrator can access the application as students.

## 3. User Data and Compatibility

- Preserve existing user accounts, authentication credentials, and student progress.
- Do not delete historical activity results, scores, or other user data.
- Remove dependencies on instructor assignments where they are no longer needed.
- Update user initialization and onboarding logic to reflect the student-only model.
- If legacy role or instructor fields exist in persistent storage, ensure they do not interfere with authentication or application functionality.
- Avoid unnecessary database schema changes or destructive migrations.

## 4. Implementation Requirements

1. Inspect the existing authentication, onboarding, user profile, and role management implementations.
2. Identify all components that request instructor information or display user roles.
3. Remove the instructor selection requirement.
4. Remove role labels displayed beside usernames.
5. Update role-dependent application logic to provide the student experience to all users.
6. Remove obsolete role-related UI controls and validation rules.
7. Preserve existing authentication, user progress tracking, activity scoring, and application navigation.
8. Follow the application's existing architecture and coding conventions.

## 5. Testing and Validation

Verify the following:

- [ ] New users can complete initial login without selecting an instructor.
- [ ] Existing users can log in without being prompted for instructor information.
- [ ] Usernames display without Student, Instructor, or Administrator labels.
- [ ] All authenticated users receive the student experience.
- [ ] Previously designated instructors and administrators can access student functionality.
- [ ] No role-based interface restrictions prevent access to standard student activities.
- [ ] Existing student progress and scores remain intact.
- [ ] Authentication and session management continue functioning correctly.
- [ ] No unrelated application features are affected.

## 6. Acceptance Criteria

The implementation is complete when:

1. Instructor selection is completely removed from initial login and onboarding.
2. Role labels no longer appear beside usernames.
3. All users are treated as students throughout the application.
4. Existing accounts and student data remain intact.
5. The application functions correctly without requiring instructor assignments or role selection.

## 7. Instructions for the AI Agent

Implement these changes using the smallest maintainable modifications possible.

Do not redesign the login interface or modify unrelated application features.

After implementation, provide a summary of:

- Files modified.
- Instructor selection functionality removed.
- Role labels and role-based behavior removed.
- Changes made to user initialization and authentication.
- Testing performed and any remaining issues.

**Important:** The application must operate as a student-only system. Instructor and Administrator roles must no longer affect the user experience. Preserve existing user data and avoid unnecessary changes to the authentication infrastructure.
