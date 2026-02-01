import axios from 'axios';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadToPinata = async (file: File): Promise<string> => {
    if (!PINATA_JWT) {
        throw new Error("Pinata JWT is not configured in environment variables.");
    }

    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
        name: `Fund Image - ${file.name}`,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': `multipart/form-data;`,
                'Authorization': `Bearer ${PINATA_JWT}`
            }
        });
        return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        throw new Error("Failed to upload image to IPFS. Please check your Pinata configuration.");
    }
};
