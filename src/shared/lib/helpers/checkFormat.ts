export const checkFormat = (value: string) => {
    if (value.split(';base64')[0]?.split(':')[1] === 'image/svg+xml') {
        return 'svg';
    }

    if (value.split('.').pop() === 'svg') {
        return 'svg';
    }

    if (value.split(';base64')[0]?.split(':')[1] === 'application/pdf') {
        return 'pdf';
    }

    if (value.split('.').pop() === 'pdf') {
        return 'pdf';
    }

    return false;
}