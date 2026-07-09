import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";
import config from 'config'

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

export default s3Client