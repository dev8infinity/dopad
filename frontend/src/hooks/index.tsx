import axios from "axios";
import { getExtensionFromBlob } from "../functions/helpers";

export async function uploadFile(endpoint: string, blob: Blob) {
    const url = `${import.meta.env.VITE_API_URL}/api/files/upload?endpoint=${endpoint}`;
    const formData = new FormData();
    formData.append('file', blob, `uploaded_file.${getExtensionFromBlob(blob)}`);

    try {
        const response = await axios.post(url, formData);
        console.log('Upload successful:', response.data);
    } catch (error) {
        console.error('Upload failed:', error);
    }
}
export async function updateContent(endpoint: string, newText: string) {
    const url = `${import.meta.env.VITE_API_URL}/api/files/update-content?endpoint=${endpoint}`;


    try {
        const response = await axios.put(url, { Text: newText });

        console.log('Upload successful:', response.data);
    } catch (error) {
        console.error('Upload failed:', error);
    }
}
export async function getEndpointDetails(endpoint: string) {
    const url = `${import.meta.env.VITE_API_URL}/api/files/details?endpoint=${endpoint}`;

    try {
        const response = await axios.get(url);
        return response.data; // Assuming the response contains the details you need
    } catch (error) {
        console.error('Failed to get endpoint details:', error);
    }
}
export async function deleteFile(fileId: string) {
    const url = `${import.meta.env.VITE_API_URL}/api/files/delete/${fileId}`;

    try {
        const response = await axios.delete(url);
        return response.data; // Assuming the response contains the details you need
    } catch (error) {
        console.error('Failed to get endpoint details:', error);
    }
}