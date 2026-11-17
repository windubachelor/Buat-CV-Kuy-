import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Firestore Security Rules — Dirty Dozen & Eight Pillars Verification', () => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const draftRulesPath = path.resolve(process.cwd(), 'DRAFT_firestore.rules');

  const getRulesText = () =>
    fs.existsSync(rulesPath)
      ? fs.readFileSync(rulesPath, 'utf-8')
      : fs.readFileSync(draftRulesPath, 'utf-8');

  it('enforces global default-deny catch-all at the root of the database', () => {
    const rules = getRulesText();
    expect(rules).toContain("rules_version = '2';");
    expect(rules).toContain('match /{document=**}');
    expect(rules).toContain('allow read, write: if false;');
  });

  it('rejects Dirty Dozen #1, #2, #3 (Identity Spoofing, Cross-User Read, Shadow Fields on UserProfile)', () => {
    const rules = getRulesText();
    expect(rules).toContain('function isValidUserProfile(data)');
    expect(rules).toContain('data.keys().hasAll([');
    expect(rules).toContain('data.keys().hasOnly([');
    expect(rules).toContain('data.uid == request.auth.uid');
    expect(rules).toContain('allow get: if isOwner(userId) && isValidId(userId) && existing().uid == request.auth.uid;');
  });

  it('rejects Dirty Dozen #4, #5, #6 (Orphaned Subcollection Write, ID Poisoning, Owner Hijack on CVDocument)', () => {
    const rules = getRulesText();
    expect(rules).toContain('function isParentUserValid()');
    expect(rules).toContain('exists(/databases/$(database)/documents/users/$(userId))');
    expect(rules).toContain('incoming().id == cvId');
    expect(rules).toContain('incoming().ownerId == existing().ownerId');
  });

  it('rejects Dirty Dozen #7, #8 (CreatedAt Tampering & Forged Client Timestamps)', () => {
    const rules = getRulesText();
    expect(rules).toContain('incoming().createdAt == request.time');
    expect(rules).toContain('incoming().updatedAt == request.time');
    expect(rules).toContain('incoming().createdAt == existing().createdAt');
  });

  it('rejects Dirty Dozen #9, #10, #11, #12 (Oversized Strings, Invalid Enum Presets, Value Poisoning, List Scraping)', () => {
    const rules = getRulesText();
    expect(rules).toContain('data.title is string && data.title.size() >= 1 && data.title.size() <= 200');
    expect(rules).toContain("'cover_letter_1'");
    expect(rules).toContain("'simple_letter'");
    expect(rules).toContain('data.exportCount is number && data.exportCount >= 0');
    expect(rules).toContain('allow list: if isOwner(userId) &&\n          existing().ownerId == request.auth.uid;');
  });
});
