import { supabase } from "./supabaseClient";

const BUCKET = "perfumes";
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export const getPerfumeImageUrl = (fileName: string): string => {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
};

export const uploadPerfumeImage = async (
  perfumeId: number,
  perfumeName: string,
  imageUri: string
): Promise<string | null> => {
  try {
    const fileName = `${perfumeId}-${perfumeName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}.jpg`;

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Erreur upload:", error.message);
      return null;
    }

    return getPerfumeImageUrl(fileName);
  } catch (e) {
    console.error("Erreur uploadPerfumeImage:", e);
    return null;
  }
};