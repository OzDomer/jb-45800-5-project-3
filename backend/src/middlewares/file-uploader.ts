import { Upload } from "@aws-sdk/lib-storage";
import type { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { randomUUID } from "crypto";
import path from "path";
import config from 'config'
import s3Client, { buildPublicUrl } from "../aws/aws";

declare global {
    namespace Express {
        interface Request {
            imageUrl: string
        }
    }
}

export default async function fileUploader(request: Request, response: Response, next: NextFunction) {
    // this middleware checks the request:
    // if there is an image file, upload it to the cloud and load its
    // public url on the request. if there is no file, just keep going
    // (update requests are allowed to keep their existing image)

    if (!request.files?.image) {
        return next()
    }

    try {
        const image = request.files.image as UploadedFile
        const key = `${randomUUID()}${path.extname(image.name)}`

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: config.get('aws.bucket'),
                Key: key,
                Body: image.data,
                ContentType: image.mimetype
            }
        })

        await upload.done()

        request.imageUrl = buildPublicUrl(key)

        next()
    } catch (e) {
        next(e)
    }
}