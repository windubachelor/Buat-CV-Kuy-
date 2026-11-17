import { z } from 'zod';

export const CustomLinkSchema = z.object({
  id: z.string(),
  label: z.string().max(60),
  url: z.string().max(300),
});

export const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi').max(120),
  headline: z.string().max(160).default(''),
  email: z.string().max(120).default(''),
  phone: z.string().max(60).default(''),
  location: z.string().max(120).default(''),
  linkedin: z.string().max(250).default(''),
  github: z.string().max(250).default(''),
  portfolio: z.string().max(250).default(''),
  customLinks: z.array(CustomLinkSchema).default([]),
});

export const SummarySchema = z.object({
  content: z.string().max(1500).default(''),
});

export const EducationItemSchema = z.object({
  id: z.string(),
  institution: z.string().max(160),
  location: z.string().max(120).default(''),
  degree: z.string().max(160),
  fieldOfStudy: z.string().max(160).default(''),
  startDate: z.string().max(40).default(''),
  endDate: z.string().max(40).default(''),
  isCurrent: z.boolean().default(false),
  gpa: z.string().max(40).default(''),
  honors: z.string().max(200).default(''),
  coursework: z.string().max(400).default(''),
  thesis: z.string().max(300).default(''),
  bullets: z.array(z.string().max(600)).default([]),
});

export const ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().max(160),
  location: z.string().max(120).default(''),
  position: z.string().max(160),
  startDate: z.string().max(40).default(''),
  endDate: z.string().max(40).default(''),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string().max(600)).default([]),
});

export const LeadershipItemSchema = z.object({
  id: z.string(),
  organization: z.string().max(160),
  location: z.string().max(120).default(''),
  role: z.string().max(160),
  startDate: z.string().max(40).default(''),
  endDate: z.string().max(40).default(''),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string().max(600)).default([]),
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  name: z.string().max(160),
  techStack: z.string().max(240).default(''),
  link: z.string().max(300).default(''),
  startDate: z.string().max(40).default(''),
  endDate: z.string().max(40).default(''),
  bullets: z.array(z.string().max(600)).default([]),
});

export const AwardItemSchema = z.object({
  id: z.string(),
  title: z.string().max(180),
  issuer: z.string().max(160).default(''),
  date: z.string().max(40).default(''),
  description: z.string().max(400).default(''),
});

export const CertificationItemSchema = z.object({
  id: z.string(),
  name: z.string().max(180),
  issuer: z.string().max(160).default(''),
  date: z.string().max(40).default(''),
  credentialId: z.string().max(120).default(''),
  url: z.string().max(300).default(''),
});

export const PublicationItemSchema = z.object({
  id: z.string(),
  title: z.string().max(240),
  authors: z.string().max(240).default(''),
  venue: z.string().max(200).default(''),
  date: z.string().max(40).default(''),
  url: z.string().max(300).default(''),
});

export const SkillCategorySchema = z.object({
  id: z.string(),
  category: z.string().max(100),
  items: z.string().max(600),
});

export const LanguageSkillSchema = z.object({
  id: z.string(),
  language: z.string().max(80),
  proficiency: z.string().max(80),
});

export const SkillsSectionSchema = z.object({
  categories: z.array(SkillCategorySchema).default([]),
  languages: z.array(LanguageSkillSchema).default([]),
  interests: z.string().max(500).default(''),
});

export const CustomSectionEntrySchema = z.object({
  id: z.string(),
  title: z.string().max(160),
  subtitle: z.string().max(160).default(''),
  location: z.string().max(120).default(''),
  date: z.string().max(60).default(''),
  bullets: z.array(z.string().max(600)).default([]),
});

export const CustomSectionSchema = z.object({
  id: z.string(),
  sectionTitle: z.string().max(120),
  entries: z.array(CustomSectionEntrySchema).default([]),
});

export const SectionKeySchema = z.enum([
  'summary',
  'education',
  'experience',
  'leadership',
  'projects',
  'awards',
  'certifications',
  'publications',
  'skills',
  'custom',
]);

export type SectionKey = z.infer<typeof SectionKeySchema>;

export const SectionConfigItemSchema = z.object({
  key: SectionKeySchema,
  visible: z.boolean().default(true),
  customTitle: z.string().max(100).optional(),
});

export type SectionConfigItem = z.infer<typeof SectionConfigItemSchema>;

export const TemplatePresetSchema = z
  .enum([
    'classic',
    'compact',
    'academic',
    'jakes',
    'wharton',
    'mckinsey',
    'cover_letter_1',
    'simple_letter',
  ])
  .default('classic');

export type TemplatePreset = z.infer<typeof TemplatePresetSchema>;

export function isCoverLetterTemplatePreset(preset?: string): boolean {
  return preset === 'cover_letter_1' || preset === 'simple_letter';
}

export const HarvardLayoutSettingsSchema = z.object({
  paperSize: z.enum(['a4', 'letter']).default('a4'),
  fontSize: z.enum(['10pt', '10.5pt', '11pt', '11.5pt']).default('11pt'),
  margin: z.enum(['normal', 'narrow', 'compact']).default('normal'),
  sectionSpacing: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
  fontFamily: z.enum(['tgtermes', 'libertinus', 'ebgaramond']).default('tgtermes'),
  showLinksIcon: z.boolean().default(false),
  dateFormat: z.enum(['short', 'numeric', 'long']).default('short'),
  cvLanguage: z.enum(['id', 'en']).default('id'),
  templatePreset: TemplatePresetSchema,
});

export type HarvardLayoutSettings = z.infer<typeof HarvardLayoutSettingsSchema>;

export const DEFAULT_SECTION_ORDER: SectionConfigItem[] = [
  { key: 'summary', visible: true },
  { key: 'education', visible: true },
  { key: 'experience', visible: true },
  { key: 'leadership', visible: true },
  { key: 'projects', visible: true },
  { key: 'awards', visible: true },
  { key: 'certifications', visible: true },
  { key: 'publications', visible: false },
  { key: 'skills', visible: true },
  { key: 'custom', visible: false },
];

export const CoverLetterSchema = z.object({
  enabled: z.boolean().default(true),
  date: z.string().max(80).default(''),
  recipientName: z.string().max(140).default(''),
  recipientTitle: z.string().max(140).default(''),
  companyName: z.string().max(160).default(''),
  companyAddress: z.string().max(240).default(''),
  subjectLine: z.string().max(200).default(''),
  salutation: z.string().max(140).default(''),
  openingParagraph: z.string().max(1800).default(''),
  bodyParagraphs: z.array(z.string().max(2000)).default([]),
  closingParagraph: z.string().max(1500).default(''),
  signOff: z.string().max(100).default(''),
  enclosures: z.array(z.string().max(300)).default([]),
  postscript: z.string().max(600).default(''),
});

export type CoverLetterData = z.infer<typeof CoverLetterSchema>;

export const DEFAULT_COVER_LETTER: CoverLetterData = {
  enabled: true,
  date: '',
  recipientName: '',
  recipientTitle: '',
  companyName: '',
  companyAddress: '',
  subjectLine: '',
  salutation: '',
  openingParagraph: '',
  bodyParagraphs: [],
  closingParagraph: '',
  signOff: '',
  enclosures: [],
  postscript: '',
};

export const DocumentModeSchema = z.enum(['cv', 'cover-letter', 'combined']).default('cv');
export type DocumentMode = z.infer<typeof DocumentModeSchema>;

export const CVDataSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(150),
  createdAt: z.string(),
  updatedAt: z.string(),
  exportCount: z.number().int().nonnegative().default(0),
  personalInfo: PersonalInfoSchema,
  summary: SummarySchema,
  education: z.array(EducationItemSchema).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  leadership: z.array(LeadershipItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  awards: z.array(AwardItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
  publications: z.array(PublicationItemSchema).default([]),
  skills: SkillsSectionSchema,
  customSections: z.array(CustomSectionSchema).default([]),
  coverLetter: CoverLetterSchema.default(DEFAULT_COVER_LETTER),
  sectionOrder: z.array(SectionConfigItemSchema).default(DEFAULT_SECTION_ORDER),
  settings: HarvardLayoutSettingsSchema,
});

export type CVData = z.infer<typeof CVDataSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type LeadershipItem = z.infer<typeof LeadershipItemSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type AwardItem = z.infer<typeof AwardItemSchema>;
export type CertificationItem = z.infer<typeof CertificationItemSchema>;
export type PublicationItem = z.infer<typeof PublicationItemSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type LanguageSkill = z.infer<typeof LanguageSkillSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;
export type CustomSectionEntry = z.infer<typeof CustomSectionEntrySchema>;

export const CompileRequestSchema = z.object({
  cv: CVDataSchema,
  mode: DocumentModeSchema.optional().default('cv'),
});

export type CompileRequest = z.infer<typeof CompileRequestSchema>;

export interface CompileResponse {
  pdfBase64: string;
  pageCount: number;
  warnings: string[];
  durationMs: number;
  engine: string;
  cached: boolean;
}

