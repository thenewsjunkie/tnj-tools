
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const uploadGif = async (file: File, title: string): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Upload the file to storage
    const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
    const { data: fileData, error: fileError } = await supabase.storage
      .from('tnj_gifs')
      .upload(fileName, file);

    if (fileError) {
      throw fileError;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('tnj_gifs')
      .getPublicUrl(fileName);

    // Save the record to the database
    const { error: dbError } = await supabase
      .from('tnj_gifs')
      .insert({
        title,
        gif_url: urlData.publicUrl,
      });

    if (dbError) {
      throw dbError;
    }

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Error uploading GIF:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

export const getApprovedGifs = async () => {
  const { data, error } = await supabase
    .from('tnj_gifs')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching GIFs:', error);
    return [];
  }

  return data;
};

export const getAllGifs = async () => {
  const { data, error } = await supabase
    .from('tnj_gifs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching GIFs:', error);
    return [];
  }

  return data;
};

export const updateGifStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
  const { error } = await supabase
    .from('tnj_gifs')
    .update({ status })
    .eq('id', id);

  return !error;
};

export const updateGifTitle = async (id: string, title: string) => {
  const { error } = await supabase
    .from('tnj_gifs')
    .update({ title })
    .eq('id', id);

  return !error;
};

export const deleteGif = async (id: string, gifUrl: string) => {
  // Extract the file name from the URL
  const fileName = gifUrl.split('/').pop();
  
  if (!fileName) {
    return false;
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('tnj_gifs')
    .remove([fileName]);

  if (storageError) {
    console.error('Error deleting GIF from storage:', storageError);
    return false;
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('tnj_gifs')
    .delete()
    .eq('id', id);

  return !dbError;
};

// Utility to get the "still" version of a GIF URL
// This is a hack that works in many browsers - adding #still to the end of a GIF URL
// prevents animation until the URL is changed back
export const getGifStillUrl = (url: string): string => {
  if (!url) return '';
  return `${url.split('#')[0]}#still`;
};

// Get the animated version by removing any hash
export const getGifAnimatedUrl = (url: string): string => {
  if (!url) return '';
  return url.split('#')[0];
};
