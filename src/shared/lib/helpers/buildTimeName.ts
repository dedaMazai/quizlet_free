import { TFunction } from "i18next";


export const buildTimeName = (value: number, t: TFunction) => {
    const countTime = value / 60;

    if (Number.isInteger(countTime)) {
        return t('час_interval', {postProcess: 'interval', count: countTime})
    }

    return Math.floor(countTime) ? `${t('час_interval', {postProcess: 'interval', count: Math.floor(countTime)})} 30 ${t('минут')}` : `30 ${t('минут')}`
}