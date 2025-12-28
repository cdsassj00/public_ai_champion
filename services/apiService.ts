
import { createClient } from '@supabase/supabase-js';
import { Champion, CertificationType } from '../types';
import { SAMPLE_CHAMPIONS } from '../constants';

const SUPABASE_URL = 'https://bvyasjtxydfdzwlaftve.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2eWFzanR4eWRmZHp3bGFmdHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDAzNzAsImV4cCI6MjA4MjQxNjM3MH0.Skg8IQgvB55jiIWYCOYLIORHpUvYHr44EIwVWxmTNtU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const apiService = {
  fetchChampions: async (): Promise<Champion[]> => {
    const { data, error } = await supabase
      .from('champions')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) return SAMPLE_CHAMPIONS;
    if (!data || data.length === 0) return SAMPLE_CHAMPIONS;

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
  },

  /**
   * Base64 데이터를 받아 Supabase Storage에 파일로 저장하고, 접근 가능한 퍼블릭 URL을 반환합니다.
   */
  uploadImage: async (base64Data: string, fileName: string): Promise<string> => {
    try {
      // 1. 유효성 검사 및 접두어 제거
      if (!base64Data) throw new Error('데이터가 없습니다.');
      const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      
      // 2. 바이너리 변환 (안전한 방식)
      const binaryString = window.atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });

      // 3. 고유 파일명 생성
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filePath = `profiles/${safeFileName}_${timestamp}_${randomStr}.jpg`;

      // 4. 업로드 실행
      const { error: uploadError } = await supabase.storage
        .from('champions')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // 5. URL 생성
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
