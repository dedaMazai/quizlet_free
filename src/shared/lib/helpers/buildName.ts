import { TLanguageUser } from "@/entities/User";

export const buildName = ({
  surname,
  name,
  middle_name,
  language,
}: {
  surname?: string,
  name?: string,
  middle_name?: string,
  language?: TLanguageUser,
}) => {
    let result = '';

    if (language === 'en') {
        if (name) {
            result = name;
        }

        if (surname) {
            result = `${result} ${surname}`;
        }

        if (middle_name) {
            result = `${result} ${middle_name}`;
        }
    } else {
        if (surname) {
            result = surname;
        }

        if (name) {
            result = `${result} ${name}`;
        }

        if (middle_name) {
            result = `${result} ${middle_name}`;
        }
    }

    return result || '-';
}
