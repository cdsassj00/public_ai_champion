
import { createClient } from '@supabase/supabase-js';
import { Champion, CertificationType } from '../types';

// Vercel 환경 변수가 있으면 그것을 사용하고, 없으면 기본값을 사용합니다.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bvyasjtxydfdzwlaftve.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2eWFzanR4eWRmZHp3bGFmdHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDAzNzAsImV4cCI6MjA4MjQxNjM3MH0.Skg8IQgvB55jiIWYCOYLIORHpUvYHr44EIwVWxmTNtU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const apiService = {
  fetchChampions: async (): Promise<Champion[]> => {
    try {
      const { data, error } = await supabase
        .from('champions')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      
      // DB에 데이터가 없거나 에러가 나면 무조건 빈 배열을 반환합니다. (김혁신 등 목업 데이터 절대 노출 금지)
      if (!data || data.length === 0) return [];

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        department: row.department,
        role: row.role,
        certType: row.cert_type as CertificationType,
        vision: row.vision,
        imageUrl: row.image_url,
        registeredAt: row.registered_at,
        projectUrl: row.project_url,
        achievement: row.achievement,
        status: row.status,
        viewCount: row.view_count || 0,
        email: row.email || '',
        password: row.password || ''
      }));
    } catch (err) {
      console.warn("Supabase fetch failed, returning empty list:", err);
      return []; // 어떤 상황에서도 빈 배열을 반환하여 Placeholder를 노출시킵니다.
    }
  },

  uploadImage: async (base64Data: string, fileName: string): Promise<string> => {
    try {
      if (!base64Data) throw new Error('데이터가 없습니다.');
      const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      
      const binaryString = window.atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });

      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filePath = `profiles/${safeFileName}_${timestamp}_${randomStr}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('champions')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('champions')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Critical Upload Error:', error);
      throw error;
    }
  },

  createChampion: async (champion: Champion): Promise<void> => {
    const { error } = await supabase
      .from('champions')
      .insert([{
        id: champion.id,
        name: champion.name,
        department: champion.department,
        role: champion.role,
        cert_type: champion.certType,
        vision: champion.vision,
        image_url: champion.imageUrl,
        registered_at: champion.registeredAt,
        project_url: champion.projectUrl,
        achievement: champion.achievement,
        status: champion.status,
        view_count: champion.viewCount,
        email: champion.email,
        password: champion.password
      }]);

    if (error) throw error;
  },

  updateChampion: async (champion: Champion): Promise<void> => {
    const { error } = await supabase
      .from('champions')
      .update({
        name: champion.name,
        department: champion.department,
        role: champion.role,
        cert_type: champion.certType,
        vision: champion.vision,
        image_url: champion.imageUrl,
        project_url: champion.projectUrl,
        achievement: champion.achievement,
        status: champion.status,
        email: champion.email,
        password: champion.password
      })
      .eq('id', champion.id);

    if (error) throw error;
  },

  deleteChampion: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('champions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  incrementView: async (id: string): Promise<void> => {
    const { data } = await supabase.from('champions').select('view_count').eq('id', id).single();
    if (data) {
      await supabase
        .from('champions')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);
    }
  }
};
