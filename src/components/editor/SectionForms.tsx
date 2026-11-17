import { arrayMove } from '@dnd-kit/sortable';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  FileBadge,
  FileText,
  FolderGit2,
  GraduationCap,
  Layers,
  Plus,
  Trash2,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import React, { useState } from 'react';
import type { CVData } from '../../shared/schema';
import {
  Badge,
  Button,
  Input,
  Label,
  MonthYearPicker,
  SkillChipsInput,
  Switch,
  Textarea,
  Tooltip,
  cn,
} from '../ui/primitives';
import { BulletListEditor } from './BulletListEditor';

export type ActiveEditorSection =
  | 'personalInfo'
  | 'summary'
  | 'education'
  | 'experience'
  | 'leadership'
  | 'projects'
  | 'awards'
  | 'certifications'
  | 'publications'
  | 'skills'
  | 'custom'
  | 'coverLetter'
  | 'layout';

interface SectionFormsProps {
  cv: CVData;
  activeSection: ActiveEditorSection;
  updateCV: (updater: (draft: CVData) => CVData) => void;
}

export const SectionForms: React.FC<SectionFormsProps> = ({
  cv,
  activeSection,
  updateCV,
}) => {
  const cvLang = cv.settings.cvLanguage;
  const [collapsedEntries, setCollapsedEntries] = useState<Record<string, boolean>>({});

  const toggleCollapse = (entryId: string) => {
    setCollapsedEntries((prev) => ({ ...prev, [entryId]: !prev[entryId] }));
  };

  if (activeSection === 'personalInfo') {
    const info = cv.personalInfo;
    const isEmailValid = !info.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email);

    return (
      <div className="space-y-6">
        {/* Pastel Header Card */}
        <div className="p-5 rounded-[20px] bg-[#B8A9F5]/22 dark:bg-[#B8A9F5]/12 border border-[#B8A9F5]/45 flex items-center justify-between gap-4 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#B8A9F5] text-[#2A2150] flex items-center justify-center shrink-0 shadow-xs">
              <User className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading">
                Informasi Pribadi & Header Kontak
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Ditampilkan terpusat di bagian paling atas CV Harvard OCS dengan huruf small-caps.
              </p>
            </div>
          </div>
          <Badge variant="lavender">Wajib</Badge>
        </div>

        <div className="p-6 surface-card grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Label htmlFor="cv-title">Judul Dokumen CV (Internal Workspace)</Label>
            <Input
              id="cv-title"
              value={cv.title}
              onChange={(e) =>
                updateCV((d) => {
                  d.title = e.target.value;
                  return d;
                })
              }
              placeholder="Mis. CV Software Engineer — GoTo 2026"
            />
            <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
              Digunakan sebagai nama dokumen di Dashboard dan metadata PDF.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="full-name" className="mb-0">
                Nama Lengkap *
              </Label>
              {info.fullName.trim() ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
              )}
            </div>
            <Input
              id="full-name"
              value={info.fullName}
              onChange={(e) =>
                updateCV((d) => {
                  d.personalInfo.fullName = e.target.value;
                  return d;
                })
              }
              placeholder="Bagaskara Adi Pratama"
            />
          </div>

          <div>
            <Label htmlFor="headline">Headline / Fokus Profesi (Opsional)</Label>
            <Input
              id="headline"
              value={info.headline}
              onChange={(e) =>
                updateCV((d) => {
                  d.personalInfo.headline = e.target.value;
                  return d;
                })
              }
              placeholder="Senior Backend & Distributed Systems Engineer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="email" className="mb-0">
                Alamat Email *
              </Label>
              {info.email.trim() && isEmailValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
              )}
            </div>
            <Input
              id="email"
              type="email"
              value={info.email}
              onChange={(e) =>
                updateCV((d) => {
                  d.personalInfo.email = e.target.value;
                  return d;
                })
              }
              placeholder="nama@alumni.ac.id"
            />
          </div>

          <div>
            <Label htmlFor="phone">Nomor Telepon / WhatsApp *</Label>
            <Input
              id="phone"
              value={info.phone}
              onChange={(e) =>
                updateCV((d) => {
                  d.personalInfo.phone = e.target.value;
                  return d;
                })
              }
              placeholder="+62 812-8890-4412"
            />
          </div>

          <div>
            <Label htmlFor="location">Kota & Negara *</Label>
            <Input
              id="location"
              value={info.location}
              onChange={(e) =>
                updateCV((d) => {
                  d.personalInfo.location = e.target.value;
                  return d;
                })
              }
              placeholder="Jakarta Selatan, Indonesia"
            />
          </div>

          <div>
            <Label htmlFor="linkedin">URL LinkedIn</Label>
            <Input
              id="linkedin"
              value={info.linkedin}
              onChange={(e) =>
                updateCV((d) => {
                  d.personalInfo.linkedin = e.target.value;
                  return d;
                })
              }
              placeholder="linkedin.com/in/username"
            />
          </div>

          <div>
            <Label htmlFor="github">URL GitHub</Label>
            <Input
              id="github"
              value={info.github}
              onChange={(e) =>
                updateCV((d) => {
                  d.personalInfo.github = e.target.value;
                  return d;
                })
              }
              placeholder="github.com/username"
            />
          </div>

          <div>
            <Label htmlFor="portfolio">Website / Portofolio</Label>
            <Input
              id="portfolio"
              value={info.portfolio}
              onChange={(e) =>
                updateCV((d) => {
                  d.personalInfo.portfolio = e.target.value;
                  return d;
                })
              }
              placeholder="portofolio.dev"
            />
          </div>

          {/* Dynamic Custom Links */}
          <div className="md:col-span-2 pt-4 border-t border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="mb-0">
                  Tautan Tambahan (Google Scholar, Medium, Behance, dll.)
                </Label>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Otomatis disanitasi ke dalam hiperlink PDF LaTeX (<code className="font-semibold">\href</code>).
                </p>
              </div>
              <Button
                variant="soft"
                size="sm"
                onClick={() =>
                  updateCV((d) => {
                    d.personalInfo.customLinks.push({
                      id: `link-${Date.now()}`,
                      label: '',
                      url: '',
                    });
                    return d;
                  })
                }
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>Tambah URL</span>
              </Button>
            </div>

            {info.customLinks.map((lnk, idx) => (
              <div key={lnk.id} className="flex items-center gap-2">
                <Input
                  value={lnk.label}
                  onChange={(e) =>
                    updateCV((d) => {
                      d.personalInfo.customLinks[idx]!.label = e.target.value;
                      return d;
                    })
                  }
                  placeholder="Label (mis. Scholar)"
                  className="w-40"
                />
                <Input
                  value={lnk.url}
                  onChange={(e) =>
                    updateCV((d) => {
                      d.personalInfo.customLinks[idx]!.url = e.target.value;
                      return d;
                    })
                  }
                  placeholder="https://scholar.google.com/..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Hapus tautan"
                  onClick={() =>
                    updateCV((d) => {
                      d.personalInfo.customLinks.splice(idx, 1);
                      return d;
                    })
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'summary') {
    const len = cv.summary.content.length;
    const isIdeal = len >= 140 && len <= 450;
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#BFEBD7]/40 dark:bg-[#214033]/75 border border-[#8CD4B5]/60 flex items-center justify-between gap-4 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#BFEBD7] text-[#133A29] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading">
                Ringkasan Eksekutif / Profil
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Gunakan 2–3 kalimat padat yang merangkum tahun pengalaman dan metrik pencapaian tertinggi Anda.
              </p>
            </div>
          </div>
          <Badge variant="mint">Opsional</Badge>
        </div>

        <div className="p-6 surface-card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="summary-text" className="mb-0">
              Paragraf Ringkasan (Mendukung **tebal** dan *miring*)
            </Label>
            <Badge variant={isIdeal ? 'mint' : len === 0 ? 'neutral' : 'butter'}>
              {len} / 1500 karakter ·{' '}
              {len === 0
                ? 'Kosong (Otomatis disembunyikan)'
                : isIdeal
                  ? 'Panjang Ideal Harvard ✓'
                  : len < 140
                    ? 'Saran: 140–450 karakter'
                    : 'Saran: Ringkas ke 3 baris'}
            </Badge>
          </div>
          <Textarea
            id="summary-text"
            rows={5}
            value={cv.summary.content}
            onChange={(e) =>
              updateCV((d) => {
                d.summary.content = e.target.value;
                return d;
              })
            }
            placeholder="Contoh: Software Engineer dengan pengalaman 5+ tahun membangun sistem pembayaran terdistribusi..."
          />
        </div>
      </div>
    );
  }

  if (activeSection === 'education') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#BDE0FE]/45 dark:bg-[#1A3044]/80 border border-[#90C7FA]/60 flex items-center justify-between gap-3 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#BDE0FE] text-[#102E4A] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading">Pendidikan Formal</h2>
                <Badge variant="sky">{cv.education.length} Entri</Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Urutkan dari jenjang pendidikan terbaru. Sertakan IPK/GPA dan mata kuliah relevan.
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() =>
              updateCV((d) => {
                d.education.push({
                  id: `edu-${Date.now()}`,
                  institution: '',
                  location: '',
                  degree: '',
                  fieldOfStudy: '',
                  startDate: '',
                  endDate: '',
                  isCurrent: false,
                  gpa: '',
                  honors: '',
                  coursework: '',
                  thesis: '',
                  bullets: [],
                });
                return d;
              })
            }
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Tambah Pendidikan</span>
          </Button>
        </div>

        <div className="space-y-4">
          {cv.education.map((edu, idx) => {
            const isCollapsed = Boolean(collapsedEntries[edu.id]);
            return (
              <div key={edu.id} className="surface-card overflow-hidden">
                {/* Accordion Entry Header */}
                <div
                  onClick={() => toggleCollapse(edu.id)}
                  className="px-5 py-3.5 bg-[var(--muted)]/50 border-b border-[var(--border)] flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Badge variant="sky">#{idx + 1}</Badge>
                    <span className="text-sm font-bold font-heading truncate">
                      {edu.institution || 'Institusi Pendidikan Baru'}
                    </span>
                    {edu.degree && (
                      <span className="hidden sm:inline text-xs text-[var(--muted-foreground)] truncate">
                        — {edu.degree}
                      </span>
                    )}
                  </div>
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip content="Pindah ke atas">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === 0}
                        onClick={() =>
                          updateCV((d) => {
                            d.education = arrayMove(d.education, idx, idx - 1);
                            return d;
                          })
                        }
                      >
                        <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Pindah ke bawah">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === cv.education.length - 1}
                        onClick={() =>
                          updateCV((d) => {
                            d.education = arrayMove(d.education, idx, idx + 1);
                            return d;
                          })
                        }
                      >
                        <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Hapus entri">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateCV((d) => {
                            d.education.splice(idx, 1);
                            return d;
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                      </Button>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => toggleCollapse(edu.id)}
                      className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] cursor-pointer"
                    >
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          isCollapsed && '-rotate-90'
                        )}
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Universitas / Institusi *</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.education[idx]!.institution = e.target.value;
                              return d;
                            })
                          }
                          placeholder="Universitas Indonesia / Harvard University"
                        />
                      </div>
                      <div>
                        <Label>Lokasi (Kota, Negara)</Label>
                        <Input
                          value={edu.location}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.education[idx]!.location = e.target.value;
                              return d;
                            })
                          }
                          placeholder="Depok, Indonesia"
                        />
                      </div>
                      <div>
                        <Label>Gelar Akademik *</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.education[idx]!.degree = e.target.value;
                              return d;
                            })
                          }
                          placeholder="Sarjana Ilmu Komputer (S.Kom.)"
                        />
                      </div>
                      <div>
                        <Label>Jurusan / Konsentrasi</Label>
                        <Input
                          value={edu.fieldOfStudy}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.education[idx]!.fieldOfStudy = e.target.value;
                              return d;
                            })
                          }
                          placeholder="Sistem Terdistribusi"
                        />
                      </div>
                      <div>
                        <Label>Tanggal Mulai (Pilih Bulan/Tahun)</Label>
                        <MonthYearPicker
                          value={edu.startDate}
                          onChange={(val) =>
                            updateCV((d) => {
                              d.education[idx]!.startDate = val;
                              return d;
                            })
                          }
                          placeholder="2020-08"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label className="mb-0">Tanggal Selesai</Label>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <Switch
                              checked={edu.isCurrent}
                              onCheckedChange={(checked) =>
                                updateCV((d) => {
                                  d.education[idx]!.isCurrent = checked;
                                  return d;
                                })
                              }
                            />
                            <span>Masih Aktif</span>
                          </label>
                        </div>
                        <MonthYearPicker
                          value={edu.endDate}
                          disabled={edu.isCurrent}
                          onChange={(val) =>
                            updateCV((d) => {
                              d.education[idx]!.endDate = val;
                              return d;
                            })
                          }
                          placeholder={edu.isCurrent ? 'Sekarang / Present' : '2024-07'}
                        />
                      </div>
                      <div>
                        <Label>IPK / GPA (Opsional)</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.education[idx]!.gpa = e.target.value;
                              return d;
                            })
                          }
                          placeholder="3.89 / 4.00"
                        />
                      </div>
                      <div>
                        <Label>Predikat / Penghargaan Akademik (Honors)</Label>
                        <Input
                          value={edu.honors}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.education[idx]!.honors = e.target.value;
                              return d;
                            })
                          }
                          placeholder="Cum Laude, Dean's List"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Mata Kuliah Relevan (Relevant Coursework)</Label>
                        <Input
                          value={edu.coursework}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.education[idx]!.coursework = e.target.value;
                              return d;
                            })
                          }
                          placeholder="Struktur Data, Algoritma, Corporate Finance, Econometrics"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Judul Skripsi / Tesis (Opsional)</Label>
                        <Input
                          value={edu.thesis}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.education[idx]!.thesis = e.target.value;
                              return d;
                            })
                          }
                          placeholder="Optimasi Konsensus Raft pada Jaringan Berlatensi Variabel..."
                        />
                      </div>
                    </div>

                    <BulletListEditor
                      bullets={edu.bullets}
                      cvLang={cvLang}
                      showQualityAnalysis={false}
                      label="Aktivitas / Pencapaian Selama Kuliah"
                      onChange={(nextBullets) =>
                        updateCV((d) => {
                          d.education[idx]!.bullets = nextBullets;
                          return d;
                        })
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeSection === 'experience') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#FFD3B6]/45 dark:bg-[#3B281D]/85 border border-[#F5B78E]/60 flex items-center justify-between gap-3 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#FFD3B6] text-[#4A2511] flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading">Pengalaman Kerja Profesional</h2>
                <Badge variant="peach">{cv.experience.length} Entri</Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Gunakan indikator kualitas Harvard OCS di setiap bullet: awali dengan kata kerja aksi dan sertakan angka dampak.
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() =>
              updateCV((d) => {
                d.experience.push({
                  id: `exp-${Date.now()}`,
                  company: '',
                  location: '',
                  position: '',
                  startDate: '',
                  endDate: '',
                  isCurrent: false,
                  bullets: [''],
                });
                return d;
              })
            }
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Tambah Pengalaman</span>
          </Button>
        </div>

        <div className="space-y-4">
          {cv.experience.map((exp, idx) => {
            const isCollapsed = Boolean(collapsedEntries[exp.id]);
            return (
              <div key={exp.id} className="surface-card overflow-hidden">
                <div
                  onClick={() => toggleCollapse(exp.id)}
                  className="px-5 py-3.5 bg-[var(--muted)]/50 border-b border-[var(--border)] flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Badge variant="peach">#{idx + 1}</Badge>
                    <span className="text-sm font-bold font-heading truncate">
                      {exp.company || 'Perusahaan Baru'}
                    </span>
                    {exp.position && (
                      <span className="hidden sm:inline text-xs text-[var(--muted-foreground)] truncate">
                        — {exp.position}
                      </span>
                    )}
                  </div>
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={idx === 0}
                      onClick={() =>
                        updateCV((d) => {
                          d.experience = arrayMove(d.experience, idx, idx - 1);
                          return d;
                        })
                      }
                    >
                      <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={idx === cv.experience.length - 1}
                      onClick={() =>
                        updateCV((d) => {
                          d.experience = arrayMove(d.experience, idx, idx + 1);
                          return d;
                        })
                      }
                    >
                      <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateCV((d) => {
                          d.experience.splice(idx, 1);
                          return d;
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                    </Button>
                    <button
                      type="button"
                      onClick={() => toggleCollapse(exp.id)}
                      className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] cursor-pointer"
                    >
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          isCollapsed && '-rotate-90'
                        )}
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nama Perusahaan / Institusi *</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.experience[idx]!.company = e.target.value;
                              return d;
                            })
                          }
                          placeholder="PT GoTo Gojek Tokopedia Tbk"
                        />
                      </div>
                      <div>
                        <Label>Lokasi (Kota, Negara)</Label>
                        <Input
                          value={exp.location}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.experience[idx]!.location = e.target.value;
                              return d;
                            })
                          }
                          placeholder="Jakarta, Indonesia"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Posisi / Jabatan *</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) =>
                            updateCV((d) => {
                              d.experience[idx]!.position = e.target.value;
                              return d;
                            })
                          }
                          placeholder="Senior Software Engineer"
                        />
                      </div>
                      <div>
                        <Label>Tanggal Mulai</Label>
                        <MonthYearPicker
                          value={exp.startDate}
                          onChange={(val) =>
                            updateCV((d) => {
                              d.experience[idx]!.startDate = val;
                              return d;
                            })
                          }
                          placeholder="2022-04"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label className="mb-0">Tanggal Selesai</Label>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <Switch
                              checked={exp.isCurrent}
                              onCheckedChange={(checked) =>
                                updateCV((d) => {
                                  d.experience[idx]!.isCurrent = checked;
                                  return d;
                                })
                              }
                            />
                            <span>Masih Bekerja</span>
                          </label>
                        </div>
                        <MonthYearPicker
                          value={exp.endDate}
                          disabled={exp.isCurrent}
                          onChange={(val) =>
                            updateCV((d) => {
                              d.experience[idx]!.endDate = val;
                              return d;
                            })
                          }
                          placeholder={exp.isCurrent ? 'Sekarang / Present' : '2024-08'}
                        />
                      </div>
                    </div>

                    <BulletListEditor
                      bullets={exp.bullets}
                      cvLang={cvLang}
                      showQualityAnalysis={true}
                      onChange={(nextBullets) =>
                        updateCV((d) => {
                          d.experience[idx]!.bullets = nextBullets;
                          return d;
                        })
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeSection === 'leadership') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#FFF1B8]/65 dark:bg-[#3A341C]/80 border border-[#EAD47A]/60 flex items-center justify-between gap-3 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#FFF1B8] text-[#453E21] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading">Kepemimpinan & Organisasi</h2>
                <Badge variant="butter">{cv.leadership.length} Entri</Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Bagian penting Harvard Business School untuk menunjukkan inisiatif kepemimpinan dan komunitas.
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() =>
              updateCV((d) => {
                d.leadership.push({
                  id: `lead-${Date.now()}`,
                  organization: '',
                  location: '',
                  role: '',
                  startDate: '',
                  endDate: '',
                  isCurrent: false,
                  bullets: [''],
                });
                return d;
              })
            }
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Tambah Organisasi</span>
          </Button>
        </div>

        <div className="space-y-4">
          {cv.leadership.map((lead, idx) => (
            <div key={lead.id} className="p-5 surface-card space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="butter">#{idx + 1}</Badge>
                  <span className="text-sm font-bold font-heading">
                    {lead.organization || 'Organisasi Baru'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={idx === 0}
                    onClick={() =>
                      updateCV((d) => {
                        d.leadership = arrayMove(d.leadership, idx, idx - 1);
                        return d;
                      })
                    }
                  >
                    <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={idx === cv.leadership.length - 1}
                    onClick={() =>
                      updateCV((d) => {
                        d.leadership = arrayMove(d.leadership, idx, idx + 1);
                        return d;
                      })
                    }
                  >
                    <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateCV((d) => {
                        d.leadership.splice(idx, 1);
                        return d;
                      })
                    }
                  >
                    <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nama Organisasi / Komunitas *</Label>
                  <Input
                    value={lead.organization}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.leadership[idx]!.organization = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Komunitas Go Indonesia"
                  />
                </div>
                <div>
                  <Label>Lokasi</Label>
                  <Input
                    value={lead.location}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.leadership[idx]!.location = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Jakarta, Indonesia"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Peran / Jabatan *</Label>
                  <Input
                    value={lead.role}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.leadership[idx]!.role = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Co-Organizer & Pembicara Teknis"
                  />
                </div>
                <div>
                  <Label>Tanggal Mulai</Label>
                  <MonthYearPicker
                    value={lead.startDate}
                    onChange={(val) =>
                      updateCV((d) => {
                        d.leadership[idx]!.startDate = val;
                        return d;
                      })
                    }
                    placeholder="2021-01"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="mb-0">Tanggal Selesai</Label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Switch
                        checked={lead.isCurrent}
                        onCheckedChange={(checked) =>
                          updateCV((d) => {
                            d.leadership[idx]!.isCurrent = checked;
                            return d;
                          })
                        }
                      />
                      <span>Masih Aktif</span>
                    </label>
                  </div>
                  <MonthYearPicker
                    value={lead.endDate}
                    disabled={lead.isCurrent}
                    onChange={(val) =>
                      updateCV((d) => {
                        d.leadership[idx]!.endDate = val;
                        return d;
                      })
                    }
                    placeholder="2023-12"
                  />
                </div>
              </div>

              <BulletListEditor
                bullets={lead.bullets}
                cvLang={cvLang}
                showQualityAnalysis={true}
                onChange={(nextBullets) =>
                  updateCV((d) => {
                    d.leadership[idx]!.bullets = nextBullets;
                    return d;
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === 'projects') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#FFC8DD]/45 dark:bg-[#3E1F2D]/80 border border-[#F4A6C4]/60 flex items-center justify-between gap-3 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#FFC8DD] text-[#4A152B] flex items-center justify-center shrink-0">
              <FolderGit2 className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading">Proyek Terpilih</h2>
                <Badge variant="rose">{cv.projects.length} Entri</Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Tampilkan proyek teknis, riset, atau produk independen beserta tech stack dan tautan repositori.
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() =>
              updateCV((d) => {
                d.projects.push({
                  id: `proj-${Date.now()}`,
                  name: '',
                  techStack: '',
                  link: '',
                  startDate: '',
                  endDate: '',
                  bullets: [''],
                });
                return d;
              })
            }
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Tambah Proyek</span>
          </Button>
        </div>

        <div className="space-y-4">
          {cv.projects.map((proj, idx) => (
            <div key={proj.id} className="p-5 surface-card space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="rose">#{idx + 1}</Badge>
                  <span className="text-sm font-bold font-heading">
                    {proj.name || 'Proyek Baru'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateCV((d) => {
                      d.projects.splice(idx, 1);
                      return d;
                    })
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nama Proyek *</Label>
                  <Input
                    value={proj.name}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.projects[idx]!.name = e.target.value;
                        return d;
                      })
                    }
                    placeholder="NusantaraKV — Distributed Store"
                  />
                </div>
                <div>
                  <Label>Tautan Proyek / GitHub</Label>
                  <Input
                    value={proj.link}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.projects[idx]!.link = e.target.value;
                        return d;
                      })
                    }
                    placeholder="github.com/username/project"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Tech Stack / Metodologi</Label>
                  <Input
                    value={proj.techStack}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.projects[idx]!.techStack = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Go, Raft Consensus, gRPC, Docker"
                  />
                </div>
                <div>
                  <Label>Tanggal Mulai</Label>
                  <MonthYearPicker
                    value={proj.startDate}
                    onChange={(val) =>
                      updateCV((d) => {
                        d.projects[idx]!.startDate = val;
                        return d;
                      })
                    }
                    placeholder="2023-05"
                  />
                </div>
                <div>
                  <Label>Tanggal Selesai</Label>
                  <MonthYearPicker
                    value={proj.endDate}
                    onChange={(val) =>
                      updateCV((d) => {
                        d.projects[idx]!.endDate = val;
                        return d;
                      })
                    }
                    placeholder="2023-11"
                  />
                </div>
              </div>

              <BulletListEditor
                bullets={proj.bullets}
                cvLang={cvLang}
                showQualityAnalysis={true}
                onChange={(nextBullets) =>
                  updateCV((d) => {
                    d.projects[idx]!.bullets = nextBullets;
                    return d;
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === 'awards') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#FFF1B8]/60 dark:bg-[#3A341C]/80 border border-[#EAD47A]/60 flex items-center justify-between gap-3 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#FFF1B8] text-[#453E21] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading">Penghargaan & Beasiswa</h2>
                <Badge variant="butter">{cv.awards.length} Entri</Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Prestasi kompetisi, fellowship, atau beasiswa merit akademik.
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() =>
              updateCV((d) => {
                d.awards.push({
                  id: `awd-${Date.now()}`,
                  title: '',
                  issuer: '',
                  date: '',
                  description: '',
                });
                return d;
              })
            }
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Tambah Penghargaan</span>
          </Button>
        </div>

        <div className="space-y-3.5">
          {cv.awards.map((awd, idx) => (
            <div key={awd.id} className="p-5 surface-card space-y-3.5">
              <div className="flex items-center justify-between">
                <Badge variant="butter">Penghargaan #{idx + 1}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateCV((d) => {
                      d.awards.splice(idx, 1);
                      return d;
                    })
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <Label>Nama Penghargaan / Beasiswa *</Label>
                  <Input
                    value={awd.title}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.awards[idx]!.title = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Juara 1 Hackathon Nasional"
                  />
                </div>
                <div>
                  <Label>Pemberi / Penyelenggara</Label>
                  <Input
                    value={awd.issuer}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.awards[idx]!.issuer = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Bank Indonesia"
                  />
                </div>
                <div>
                  <Label>Tanggal (Pilih Bulan/Tahun)</Label>
                  <MonthYearPicker
                    value={awd.date}
                    onChange={(val) =>
                      updateCV((d) => {
                        d.awards[idx]!.date = val;
                        return d;
                      })
                    }
                    placeholder="2023-10"
                  />
                </div>
                <div className="md:col-span-3">
                  <Label>Keterangan Singkat (1 baris)</Label>
                  <Input
                    value={awd.description}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.awards[idx]!.description = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Terpilih dari 340 tim peserta tingkat nasional."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === 'certifications') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#BFEBD7]/45 dark:bg-[#214033]/80 border border-[#8CD4B5]/60 flex items-center justify-between gap-3 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#BFEBD7] text-[#133A29] flex items-center justify-center shrink-0">
              <FileBadge className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading">Sertifikasi & Lisensi</h2>
                <Badge variant="mint">{cv.certifications.length} Entri</Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Sertifikasi industri resmi (CFA, CPA, AWS/GCP Architect, CKA, PMP, dll.).
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() =>
              updateCV((d) => {
                d.certifications.push({
                  id: `cert-${Date.now()}`,
                  name: '',
                  issuer: '',
                  date: '',
                  credentialId: '',
                  url: '',
                });
                return d;
              })
            }
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Tambah Sertifikasi</span>
          </Button>
        </div>

        <div className="space-y-3.5">
          {cv.certifications.map((cert, idx) => (
            <div key={cert.id} className="p-5 surface-card space-y-3.5">
              <div className="flex items-center justify-between">
                <Badge variant="mint">Sertifikasi #{idx + 1}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateCV((d) => {
                      d.certifications.splice(idx, 1);
                      return d;
                    })
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <Label>Nama Sertifikasi *</Label>
                  <Input
                    value={cert.name}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.certifications[idx]!.name = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Google Cloud Professional Cloud Architect"
                  />
                </div>
                <div>
                  <Label>Lembaga Penerbit</Label>
                  <Input
                    value={cert.issuer}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.certifications[idx]!.issuer = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Google Cloud"
                  />
                </div>
                <div>
                  <Label>Tanggal Terbit</Label>
                  <MonthYearPicker
                    value={cert.date}
                    onChange={(val) =>
                      updateCV((d) => {
                        d.certifications[idx]!.date = val;
                        return d;
                      })
                    }
                    placeholder="2024-02"
                  />
                </div>
                <div>
                  <Label>ID Kredensial (Opsional)</Label>
                  <Input
                    value={cert.credentialId}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.certifications[idx]!.credentialId = e.target.value;
                        return d;
                      })
                    }
                    placeholder="GCP-PCA-992817"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === 'publications') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#BDE0FE]/45 dark:bg-[#1A3044]/80 border border-[#90C7FA]/60 flex items-center justify-between gap-3 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#BDE0FE] text-[#102E4A] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading">Publikasi Ilmiah & Jurnal</h2>
                <Badge variant="sky">{cv.publications.length} Entri</Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Jurnal, prosiding konferensi (IEEE/ACM/Springer), atau makalah riset.
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() =>
              updateCV((d) => {
                d.publications.push({
                  id: `pub-${Date.now()}`,
                  title: '',
                  authors: '',
                  venue: '',
                  date: '',
                  url: '',
                });
                const sec = d.sectionOrder.find((s) => s.key === 'publications');
                if (sec) sec.visible = true;
                return d;
              })
            }
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Tambah Publikasi</span>
          </Button>
        </div>

        <div className="space-y-3.5">
          {cv.publications.map((pub, idx) => (
            <div key={pub.id} className="p-5 surface-card space-y-3.5">
              <div className="flex items-center justify-between">
                <Badge variant="sky">Publikasi #{idx + 1}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    updateCV((d) => {
                      d.publications.splice(idx, 1);
                      return d;
                    })
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="md:col-span-2">
                  <Label>Judul Makalah / Publikasi *</Label>
                  <Input
                    value={pub.title}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.publications[idx]!.title = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Adaptive Quorum Reads in Geo-Distributed Financial Ledgers"
                  />
                </div>
                <div>
                  <Label>Daftar Penulis</Label>
                  <Input
                    value={pub.authors}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.publications[idx]!.authors = e.target.value;
                        return d;
                      })
                    }
                    placeholder="B. A. Pratama, R. Wijaya"
                  />
                </div>
                <div>
                  <Label>Nama Jurnal / Konferensi</Label>
                  <Input
                    value={pub.venue}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.publications[idx]!.venue = e.target.value;
                        return d;
                      })
                    }
                    placeholder="IEEE International Conference on Cloud Engineering"
                  />
                </div>
                <div>
                  <Label>Tanggal Publikasi</Label>
                  <MonthYearPicker
                    value={pub.date}
                    onChange={(val) =>
                      updateCV((d) => {
                        d.publications[idx]!.date = val;
                        return d;
                      })
                    }
                    placeholder="2022-09"
                  />
                </div>
                <div>
                  <Label>URL DOI / Tautan</Label>
                  <Input
                    value={pub.url}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.publications[idx]!.url = e.target.value;
                        return d;
                      })
                    }
                    placeholder="doi.org/10.1109/..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === 'skills') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#B8A9F5]/25 dark:bg-[#B8A9F5]/14 border border-[#B8A9F5]/45 flex items-center justify-between gap-3 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#B8A9F5] text-[#2A2150] flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading">Keahlian, Bahasa & Minat</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Ketik nama keahlian lalu tekan <strong>Enter</strong> untuk menambahkan chip tag. Tekan <strong>Backspace</strong> untuk menghapus.
              </p>
            </div>
          </div>
          <Badge variant="lavender">{cv.skills.categories.length} Kategori</Badge>
        </div>

        {/* Dynamic Skill Categories with Interactive Chips Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Kategori Keahlian (Technical, Tools, Frameworks, dll.)</Label>
            <Button
              variant="soft"
              size="sm"
              onClick={() =>
                updateCV((d) => {
                  d.skills.categories.push({
                    id: `sk-${Date.now()}`,
                    category: '',
                    items: '',
                  });
                  return d;
                })
              }
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Tambah Kategori</span>
            </Button>
          </div>

          {cv.skills.categories.map((cat, idx) => (
            <div key={cat.id} className="p-5 surface-card space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 max-w-xs">
                  <Label>Nama Kategori Skill</Label>
                  <Input
                    value={cat.category}
                    onChange={(e) =>
                      updateCV((d) => {
                        d.skills.categories[idx]!.category = e.target.value;
                        return d;
                      })
                    }
                    placeholder="Mis. Bahasa Pemrograman"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-5"
                  onClick={() =>
                    updateCV((d) => {
                      d.skills.categories.splice(idx, 1);
                      return d;
                    })
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                </Button>
              </div>

              <div>
                <Label>Daftar Skill (Tekan Enter untuk menambah chip)</Label>
                <SkillChipsInput
                  value={cat.items}
                  onChange={(nextCommaString) =>
                    updateCV((d) => {
                      d.skills.categories[idx]!.items = nextCommaString;
                      return d;
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Languages */}
        <div className="p-5 surface-card space-y-3.5">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Penguasaan Bahasa & Skor Sertifikasi</Label>
            <Button
              variant="soft"
              size="sm"
              onClick={() =>
                updateCV((d) => {
                  d.skills.languages.push({
                    id: `lg-${Date.now()}`,
                    language: '',
                    proficiency: '',
                  });
                  return d;
                })
              }
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Tambah Bahasa</span>
            </Button>
          </div>

          {cv.skills.languages.map((lg, idx) => (
            <div key={lg.id} className="flex items-center gap-2">
              <Input
                value={lg.language}
                onChange={(e) =>
                  updateCV((d) => {
                    d.skills.languages[idx]!.language = e.target.value;
                    return d;
                  })
                }
                placeholder="Bahasa Inggris"
                className="flex-1"
              />
              <Input
                value={lg.proficiency}
                onChange={(e) =>
                  updateCV((d) => {
                    d.skills.languages[idx]!.proficiency = e.target.value;
                    return d;
                  })
                }
                placeholder="Profesional Penuh (IELTS 8.0)"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  updateCV((d) => {
                    d.skills.languages.splice(idx, 1);
                    return d;
                  })
                }
              >
                <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
              </Button>
            </div>
          ))}
        </div>

        {/* Interests */}
        <div className="p-5 surface-card">
          <Label htmlFor="interests-input">
            Minat & Hobi (Opsional — Pembuka Percakapan Wawancara)
          </Label>
          <Input
            id="interests-input"
            value={cv.skills.interests}
            onChange={(e) =>
              updateCV((d) => {
                d.skills.interests = e.target.value;
                return d;
              })
            }
            placeholder="Lari Maraton 42K, Kontributor Open-Source, Catur Klasik"
          />
        </div>
      </div>
    );
  }

  if (activeSection === 'custom') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-[20px] bg-[#FFD3B6]/45 dark:bg-[#3B281D]/80 border border-[#F5B78E]/60 flex items-center justify-between gap-3 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-[#FFD3B6] text-[#4A2511] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading">Section Kustom</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Buat bagian khusus sesuai kebutuhan (mis. Pengalaman Mengajar, Paten, Konferensi, atau Kegiatan Sosial).
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={() =>
              updateCV((d) => {
                d.customSections.push({
                  id: `csec-${Date.now()}`,
                  sectionTitle: 'Pengalaman Tambahan',
                  entries: [
                    {
                      id: `cent-${Date.now()}`,
                      title: '',
                      subtitle: '',
                      location: '',
                      date: '',
                      bullets: [''],
                    },
                  ],
                });
                const sec = d.sectionOrder.find((s) => s.key === 'custom');
                if (sec) sec.visible = true;
                return d;
              })
            }
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Buat Section Kustom</span>
          </Button>
        </div>

        {cv.customSections.map((csec, sIdx) => (
          <div key={csec.id} className="p-5 surface-card space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div className="flex-1">
                <Label>Judul Section Kustom *</Label>
                <Input
                  value={csec.sectionTitle}
                  onChange={(e) =>
                    updateCV((d) => {
                      d.customSections[sIdx]!.sectionTitle = e.target.value;
                      return d;
                    })
                  }
                  placeholder="Mis. Pengalaman Mengajar & Asistensi"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-5"
                onClick={() =>
                  updateCV((d) => {
                    d.customSections.splice(sIdx, 1);
                    return d;
                  })
                }
              >
                <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
              </Button>
            </div>

            {csec.entries.map((entry, eIdx) => (
              <div
                key={entry.id}
                className="p-4 rounded-[14px] bg-[var(--background)] border border-[var(--border)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="peach">Entri #{eIdx + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateCV((d) => {
                        d.customSections[sIdx]!.entries.splice(eIdx, 1);
                        return d;
                      })
                    }
                  >
                    <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Judul Entri / Institusi *</Label>
                    <Input
                      value={entry.title}
                      onChange={(e) =>
                        updateCV((d) => {
                          d.customSections[sIdx]!.entries[eIdx]!.title = e.target.value;
                          return d;
                        })
                      }
                      placeholder="Fakultas Ilmu Komputer UI"
                    />
                  </div>
                  <div>
                    <Label>Lokasi</Label>
                    <Input
                      value={entry.location}
                      onChange={(e) =>
                        updateCV((d) => {
                          d.customSections[sIdx]!.entries[eIdx]!.location = e.target.value;
                          return d;
                        })
                      }
                      placeholder="Depok, Indonesia"
                    />
                  </div>
                  <div>
                    <Label>Subjudul / Peran</Label>
                    <Input
                      value={entry.subtitle}
                      onChange={(e) =>
                        updateCV((d) => {
                          d.customSections[sIdx]!.entries[eIdx]!.subtitle = e.target.value;
                          return d;
                        })
                      }
                      placeholder="Koordinator Asisten Dosen"
                    />
                  </div>
                  <div>
                    <Label>Periode Waktu</Label>
                    <Input
                      value={entry.date}
                      onChange={(e) =>
                        updateCV((d) => {
                          d.customSections[sIdx]!.entries[eIdx]!.date = e.target.value;
                          return d;
                        })
                      }
                      placeholder="2019 -- 2020"
                    />
                  </div>
                </div>
                <BulletListEditor
                  bullets={entry.bullets}
                  cvLang={cvLang}
                  showQualityAnalysis={false}
                  onChange={(nextBullets) =>
                    updateCV((d) => {
                      d.customSections[sIdx]!.entries[eIdx]!.bullets = nextBullets;
                      return d;
                    })
                  }
                />
              </div>
            ))}

            <Button
              variant="soft"
              size="sm"
              onClick={() =>
                updateCV((d) => {
                  d.customSections[sIdx]!.entries.push({
                    id: `cent-${Date.now()}`,
                    title: '',
                    subtitle: '',
                    location: '',
                    date: '',
                    bullets: [''],
                  });
                  return d;
                })
              }
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Tambah Entri di Section Ini</span>
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return null;
};
