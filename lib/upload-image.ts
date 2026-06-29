import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

let r2: S3Client | null = null;

function getR2Client() {
  r2 ??= new S3Client({
    region: "auto", // required for R2
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_UPLOAD_IMAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY!,
    },
  });

  return r2;
}

export const uploadImageAssets = async (buffer: Buffer, key: string) => {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_UPLOAD_IMAGE_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: "image/*",
      ACL: "public-read", // optional if bucket is public
    })
  );

  const publicUrl = `https://pub-6f0cf05705c7412b93a792350f3b3aa5.r2.dev/${key}`;
  return publicUrl;
};
