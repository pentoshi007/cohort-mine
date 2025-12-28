import { atom } from 'recoil';

export const networkAtom = atom({
    key: 'network',
    default: 100
});
export const jobsAtom = atom({
    key: 'jobs',
    default: 1
});
export const notificationsAtom = atom({
    key: 'notifications',
    default: 10
});
export const messagingAtom = atom({
    key: 'messaging',
    default: 0
});