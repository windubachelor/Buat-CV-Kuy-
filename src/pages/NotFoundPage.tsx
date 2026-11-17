import { ArrowLeft, FileQuestion } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/primitives';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9FF] dark:bg-[#12101B] p-6">
      <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#1B1828] border border-[#E8E4F8] dark:border-[#2E2944] p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#B8A9F5]/30 text-[#2A2150] dark:text-[#B8A9F5] flex items-center justify-center mx-auto">
          <FileQuestion className="w-7 h-7" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold font-heading text-[#1F1B2E] dark:text-[#F4F2FA]">
          404 — Halaman Tidak Ditemukan
        </h1>
        <p className="text-xs text-[#5B5475] dark:text-[#A69FC2]">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          <span>Kembali ke Dashboard CV</span>
        </Button>
      </div>
    </div>
  );
};
