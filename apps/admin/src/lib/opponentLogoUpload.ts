import { uploadRosterPhoto } from "@/lib/rosterPhotoUpload";

export async function uploadOpponentLogo(file: File) {
    return uploadRosterPhoto(file, "opponents");
}
