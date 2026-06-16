export async function fetchImageAsFile(imageSrc: string) {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const file = new File(
        [blob],
        imageSrc.split('/').pop() || '',
        { type: blob.type }
    );
    return file;
}