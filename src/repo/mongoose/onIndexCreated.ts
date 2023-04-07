
export const INDEX_EVENT = 'index';
export function onIndexCreated(error: any) {
    if (error !== undefined) {
        // tslint:disable-next-line:no-console
        console.error('index event emitted.', error);
    }
}
