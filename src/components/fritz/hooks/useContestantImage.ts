import { supabase } from "@/integrations/supabase/client";

export const useContestantImage = () => {
  const uploadImage = async (position: number, file: File) => {
    console.log('Uploading image for position:', position);
    console.log('File:', file.name, file.type, file.size);

    const fileExt = file.name.split('.').pop();
    const fileName = `${position}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Generated file path:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('fritz_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    console.log('Successfully uploaded image to storage');

    const { data: { publicUrl } } = supabase.storage
      .from('fritz_images')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  };

  const deleteImage = async (imageUrl: string | null) => {
    if (!imageUrl) return;
    
    console.log('Attempting to delete image:', imageUrl);
    const imagePath = imageUrl.split('/').pop();
    console.log('Extracted image path:', imagePath);
    
    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from('fritz_images')
        .remove([imagePath]);

      if (storageError) {
        console.error('Error removing image from storage:', storageError);
        return false;
      }
      console.log('Successfully deleted image from storage');
      return true;
    }
    return false;
  };

  const updateDefaultContestantImage = async (name: string, imageUrl: string | null) => {
    console.log('Updating default contestant image:', { name, imageUrl });
    
    const { error } = await supabase
      .from('fritz_default_contestants')
      .update({ image_url: imageUrl })
      .eq('name', name);

    if (error) {
      console.error('Error updating default contestant image:', error);
      return false;
    }

    console.log('Successfully updated default contestant image');
    return true;
  };

  return {
    uploadImage,
    deleteImage,
    updateDefaultContestantImage
  };
};