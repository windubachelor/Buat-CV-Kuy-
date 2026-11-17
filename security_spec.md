# Security Specification — Buat CV Kuy (Firestore Zero-Trust Architecture)

## 1. Data Invariants
1. **Strict Ownership Isolation**: Every `/users/{userId}` document can only be created, read, updated, or deleted by the authenticated user whose `request.auth.uid == userId` and `data.uid == userId`.
2. **Master Gate Relational Sync**: Every `/users/{userId}/cvs/{cvId}` document belongs to parent `/users/{userId}`. Access requires `request.auth.uid == userId`, `data.ownerId == request.auth.uid`, and parent existence (`exists` or `existsAfter` for atomic initial registration batch).
3. **Strict Key & Volumetric Validation**: No shadow fields (`hasOnly`) or missing required fields (`hasAll`) are permitted on `UserProfile` or `CVDocument`. Every string is strictly bounded by `.size()`.
4. **Immutable Identity & Temporal Integrity**: `uid`, `ownerId`, `id`, and `createdAt` are immutable across all update actions. `createdAt` (on create) and `updatedAt` (on create and update) must equal `request.time`.
5. **Query Enforcer on List**: Listing `/users/{userId}/cvs` requires `request.auth.uid == userId` and `resource.data.ownerId == request.auth.uid`.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Identity Spoofing on User Create)**: Authenticated as `user_A`, attempting to create `/users/user_A` with `uid: "user_B"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Cross-User PII Read)**: Authenticated as `user_B`, attempting `get` on `/users/user_A`. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow Field Injection on User Create)**: Creating `/users/user_A` with an undeclared field `isAdmin: true`. -> `PERMISSION_DENIED`
4. **Payload 4 (Orphaned Subcollection Write)**: Creating `/users/user_A/cvs/cv_1` when `/users/user_A` does not exist before or after the transaction. -> `PERMISSION_DENIED`
5. **Payload 5 (ID Poisoning / Path Mismatch)**: Creating `/users/user_A/cvs/cv_1` where `data.id == "cv_other"` or `cvId` contains invalid characters. -> `PERMISSION_DENIED`
6. **Payload 6 (Owner Hijack on CV Update)**: Updating `/users/user_A/cvs/cv_1` to change `ownerId` to `"user_B"`. -> `PERMISSION_DENIED`
7. **Payload 7 (CreatedAt Tampering on Update)**: Updating `/users/user_A/cvs/cv_1` with a modified `createdAt` timestamp. -> `PERMISSION_DENIED`
8. **Payload 8 (Forged Client Timestamp on Create)**: Creating `/users/user_A/cvs/cv_1` with `createdAt` set to a past timestamp instead of `request.time`. -> `PERMISSION_DENIED`
9. **Payload 9 (Denial of Wallet — Oversized Title String)**: Creating `/users/user_A/cvs/cv_1` with `title` length > 200 characters. -> `PERMISSION_DENIED`
10. **Payload 10 (Invalid Enum Value on TemplatePreset)**: Updating `/users/user_A/cvs/cv_1` with `templatePreset: "hacked_preset"`. -> `PERMISSION_DENIED`
11. **Payload 11 (Value Poisoning on Update)**: Updating `/users/user_A/cvs/cv_1` with `exportCount: -5` or `exportCount: "many"`. -> `PERMISSION_DENIED`
12. **Payload 12 (Unauthorized Cross-User List Scraping)**: Authenticated as `user_B`, attempting `list` on `/users/user_A/cvs`. -> `PERMISSION_DENIED`
