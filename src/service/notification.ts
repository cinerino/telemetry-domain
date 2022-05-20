/**
 * 通知サービス
 */
import { OK } from 'http-status';
import * as request from 'request';

import { credentials } from '../credentials';

export type Operation<T> = () => Promise<T>;

/**
 * 開発者に報告する
 * @link https://notify-bot.line.me/doc/ja/
 */
export function report2developers(subject: string, content: string, imageThumbnail?: string, imageFullsize?: string): Operation<void> {
    return async () => {
        const LINE_NOTIFY_URL = credentials.lineNotify.url;
        const LINE_NOTIFY_ACCESS_TOKEN = credentials.lineNotify.accessToken;
        if (LINE_NOTIFY_URL === undefined) {
            throw new Error('Environment variable LINE_NOTIFY_URL not set');
        }
        if (LINE_NOTIFY_ACCESS_TOKEN === undefined) {
            throw new Error('Environment variable LINE_NOTIFY_ACCESS_TOKEN not set');
        }

        const message = `
env[${process.env.NODE_ENV}]
------------------------
${subject}
------------------------
${content}`
            ;

        // LINE通知APIにPOST
        const formData: any = {
            message: message,
            ...(typeof imageThumbnail === 'string') ? { imageThumbnail } : undefined,
            ...(typeof imageFullsize === 'string') ? { imageFullsize } : undefined
        };

        return new Promise<void>((resolve, reject) => {
            request.post(
                {
                    url: LINE_NOTIFY_URL,
                    auth: { bearer: LINE_NOTIFY_ACCESS_TOKEN },
                    form: formData,
                    json: true
                },
                (error, response, body) => {
                    if (error !== null) {
                        reject(error);
                    } else {
                        switch (response.statusCode) {
                            case OK:
                                resolve();
                                break;
                            default:
                                reject(new Error(body.message));
                        }
                    }
                }
            );
        });
    };
}
