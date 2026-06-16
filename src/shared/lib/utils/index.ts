
export { createAsyncComponent } from './createAsyncComponent';
export { generateUserColor } from './generateUserColor';

export function determinateString(value: string[] | string) {
  return Array.isArray(value)
    ? value
    : value?.split(',')
      .filter(Boolean);
}

export function formatTime(date: Date, withSeconds = true): string {
  const hour = date.getHours()
    .toString()
    .padStart(2, '0');
  const minute = date.getMinutes()
    .toString()
    .padStart(2, '0');
  const second = date.getSeconds()
    .toString()
    .padStart(2, '0');

  if (withSeconds) {
    return `${hour}:${minute}:${second}`;
  }

  return `${hour}:${minute}`;
}

export function exportData(data: Record<string, unknown>, name: string) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

  const hiddenElement = document.createElement('a');
  const url = window.URL || window.webkitURL;
  const blobRes = url.createObjectURL(blob);
  hiddenElement.href = blobRes;
  hiddenElement.target = '_blank';
  hiddenElement.download = `${name}.json`;
  hiddenElement.click();

  if (hiddenElement && hiddenElement.parentNode) {
    hiddenElement.parentNode.removeChild(hiddenElement);
  }
}

export async function importData(file: File, handler: (res: unknown) => void) {
  let res: unknown;

  await new Response(file)
    .json()
    .then((json) => {
      res = json;
    });

  handler(res);
}

export const blobToDataURL = async (blob:Blob) => {
  const a = new FileReader();

  return new Promise<string>((resolve, reject) => {
    a.readAsDataURL(blob);

    a.onload = (e) => {
      if (!e.target?.result) {
        return reject();
      }

      return resolve(String(e.target.result));
    };
  });
};

export const downloadFile = (value: string, fileName: string) => {
  const fakeLink = window.document.createElement('a');
  // @ts-ignore — assigning style as string for quick inline style override
  fakeLink.style = 'display:none;';
  fakeLink.target = '_blank';
  fakeLink.download = fileName;

  // const url = window.URL || window.webkitURL;
  // const blobRes = isBlob ? value : url.createObjectURL(value);
  fakeLink.href = value;

  document.body.appendChild(fakeLink);
  fakeLink.click();
  document.body.removeChild(fakeLink);

  fakeLink.remove();
};

export const downloadImageFromSrc = async (url: string, fileName?: string) => {
  if (!fileName) {
    downloadFile(url, '');

    return;
  }

  const response = await fetch(url);

  if (!response.ok) {
    return;
  }

  const blob = await response.blob();
  const dataUrl = await blobToDataURL(blob);

  const a = document.createElement('a');
  // @ts-ignore — assigning style as string for quick inline style override
  a.style = 'display:none;';
  a.href = dataUrl;
  a.download = fileName; // File name Here
  a.click(); // Downloaded file
  a.remove();
};

export const insertToArray = <T>(array: T[], valueToInsert: T, index: number):T[] => [
  ...array.slice(0, index),
  valueToInsert,
  ...array.slice(index),
];

export const replaceInArray = <T>(array: T[], valueToInsert: T, index: number):T[] => [
  ...array.slice(0, index),
  valueToInsert,
  ...array.slice(index + 1),
];

export const isNumber = (value: string | null | undefined) => {
  if (typeof value === 'string') {
    return !Number.isNaN(Number(value));
  }

  return false;
};
