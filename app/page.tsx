'use client';

import ChatInterface from '@/components/chat-interface';
import { useTranslation } from 'react-i18next';
import i18n from '@/locales/i18n'; 

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Ví dụ hiển thị dòng giới thiệu có dịch */}
        <h1 className="text-2xl font-bold mb-4">{t('welcome')}</h1>

        <ChatInterface />

        {/* Nút đổi ngôn ngữ để test */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => i18n.changeLanguage('vi')}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Tiếng Việt
          </button>
          <button
            onClick={() => i18n.changeLanguage('en')}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            English
          </button>
        </div>
      </div>
    </main>
  );
}
