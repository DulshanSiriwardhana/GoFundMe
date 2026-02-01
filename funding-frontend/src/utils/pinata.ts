import axios from 'axios';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadToPinata = async (file: File): Promise<string> => {
    if (!PINATA_JWT || PINATA_JWT === 'your_pinata_jwt_here') {
        throw new Error("Pinata JWT is not configured. Please get your JWT from Pinata.cloud and paste it into funding-frontend/.env");
    }

    let safeName = file.name;
    if (file.name.length > 50) {
        const extIndex = file.name.lastIndexOf('.');
        const ext = extIndex !== -1 ? file.name.substring(extIndex) : '';
        const nameWithoutExt = extIndex !== -1 ? file.name.substring(0, extIndex) : file.name;
        safeName = nameWithoutExt.substring(0, 40) + "..." + ext;
    }

    const formData = new FormData();
    // Use safeName as the third argument to override the long filename
    formData.append('file', file, safeName);

    const metadata = JSON.stringify({
        name: `Fund Image - ${safeName}`,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
        console.log("Attempting Pinata upload...");
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: Infinity,
            headers: {
                'Authorization': `Bearer ${PINATA_JWT.trim()}`
            }
        });
        return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Pinata error details:", error.response.data);
            throw new Error(`Pinata upload failed: ${JSON.stringify(error.response.data)}`);
        }
        console.error("Error uploading to Pinata:", error);
        throw new Error("Failed to upload image to IPFS. Please check your Pinata configuration.");
    }
};
