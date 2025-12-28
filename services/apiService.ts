
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
      passcode: row.passcode || '0000'
    }));
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
        passcode: champion.passcode
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
        passcode: champion.passcode
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
