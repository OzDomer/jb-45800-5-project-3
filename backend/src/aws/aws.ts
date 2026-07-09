import { CreateBucketCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import config from 'config'
import { readdir, readFile } from "fs/promises";
import path from "path";

// this is a way to clone deeply - config sub-objects are immutable,
// and the aws sdk mutates its config object
const s3Config = JSON.parse(JSON.stringify(config.get('aws.connection')))
const s3Client = new S3Client(s3Config)

export async function createAppBucketIfNotExist() {
    try {
        const response = await s3Client.send(new CreateBucketCommand({
            Bucket: config.get('aws.bucket')
        }))
        console.log('created bucket', response.Location)
    } catch (e) {
        // ignore - the bucket probably already exists
        console.log('exception in create bucket, probably already exists')
    }
}

// the sdk reports upload locations using the endpoint it connected through
// (e.g. http://localstack:4566 inside compose), which the browser cannot reach.
// so public urls are always built from aws.publicUrl instead.
export function buildPublicUrl(key: string): string {
    return `${config.get('aws.publicUrl')}/${config.get('aws.bucket')}/${key}`
}

const contentTypeByExtension: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
}

async function keyExists(key: string): Promise<boolean> {
    try {
        await s3Client.send(new HeadObjectCommand({
            Bucket: config.get('aws.bucket'),
            Key: key
        }))
        return true
    } catch {
        return false
    }
}

// the seed sql file references image urls with these exact keys,
// so localstack must hold them after every fresh start
export async function uploadSeedImagesIfMissing() {
    // cwd is the backend folder in dev and /app in docker - both hold seed-images
    const seedImagesDir = path.join(process.cwd(), 'seed-images')

    let fileNames: string[]
    try {
        fileNames = await readdir(seedImagesDir)
    } catch {
        console.log('no seed-images folder found, skipping seed images upload')
        return
    }

    for (const fileName of fileNames) {
        const contentType = contentTypeByExtension[path.extname(fileName).toLowerCase()]

        if (!contentType) continue

        if (await keyExists(fileName)) continue

        await s3Client.send(new PutObjectCommand({
            Bucket: config.get('aws.bucket'),
            Key: fileName,
            Body: await readFile(path.join(seedImagesDir, fileName)),
            ContentType: contentType
        }))

        console.log(`uploaded seed image: ${fileName}`)
    }
}

export default s3Client