// // utils/azureBlob.ts

// import {
//   BlobServiceClient,
//   StorageSharedKeyCredential,
//   generateBlobSASQueryParameters,
//   BlobSASPermissions,
//   logger
// } from "@azure/storage-blob";

// const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
// const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
// const containerName = process.env.AZURE_STORAGE_CONTAINER;
// const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

// logger.info(`Value of azure storage string: ${connectionString}`);

// const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
// const containerClient = blobServiceClient.getContainerClient(containerName);

// const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

// export const generateUploadSAS = async (fileName, fileType) => {
//   const expiresOn = new Date(new Date().valueOf() + 5 * 60 * 1000); // 5 mins

//   const sasToken = generateBlobSASQueryParameters(
//     {
//       containerName,
//       blobName: fileName,
//       permissions: BlobSASPermissions.parse("cw"), // create + write
//       expiresOn,
//       contentType: fileType
//     },
//     sharedKeyCredential
//   ).toString();

//   const url = `https://${account}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;

//   return {
//     uploadUrl: url,
//     blobUrl: `https://${account}.blob.core.windows.net/${containerName}/${fileName}`
//   };
// };

// function getBlobNameFromUrl(blobUrl){
//   const url = new URL(blobUrl);
//   console.log('Value of url', url);

//   return url.pathname.split("/").slice(2).join("/");
// }

// export const deleteFromAzure= async(blobUrl)=>{
//     try{
//         if(!blobUrl) return;
//         if (!blobUrl.includes("blob.core.windows.net")) return;
//         const blobName = getBlobNameFromUrl(blobUrl);
        
//         const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//         const exists = await blockBlobClient.exists();

//         if(!exists){
//             logger.warning("Blob not found, skipping delete:", blobName);
//             return;
//         }
//         await blockBlobClient.delete();
//         logger.info("Deleted blob:", blobName);

//     }catch(err){
//         logger.error("Error while deleting blob:", err);
//     }

// }

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions
} from "@azure/storage-blob";

const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

const BASE_URL = `https://${account}.blob.core.windows.net/${containerName}`;


// ✅ GENERATE UPLOAD SAS (WRITE)
export const generateUploadSAS = async (blobName, fileType) => {
  const expiresOn = new Date(Date.now() + 5 * 60 * 1000);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"),
      expiresOn,
      contentType: fileType
    },
    sharedKeyCredential
  ).toString();

  return {
    uploadUrl: `${BASE_URL}/${blobName}?${sasToken}`,
    blobName
  };
};


// ✅ GENERATE READ SAS (SECURE VIEW)
export const generateReadSAS = (blobName) => {
  const expiresOn = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn
    },
    sharedKeyCredential
  ).toString();

  return `${BASE_URL}/${blobName}?${sasToken}`;
};


// ✅ DELETE
export const deleteFromAzure = async (blobName) => {
    try{
        if (!blobName) return;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const exists = await blockBlobClient.exists();
        if(!exists){
            console.warn("Blob not found:", blobName);
            return;
        }

        await blockBlobClient.delete();
        console.log("Deleted blob:", blobName);
    }catch(err){
        console.error("Delete error:", err);
    }

};

