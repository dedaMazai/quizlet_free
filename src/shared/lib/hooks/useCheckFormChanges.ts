import { useCallback } from "react";

interface FileItem {
    id?: string;
    file?: File;
}

interface UseFormChangeDetectionOptions<T> {
    editMode?: boolean;
    currentData?: Partial<T>;
    currentFiles?: FileItem[];
    initialForm?: Partial<T>;
}

type ResFunc<T> = (params: {formFiles?: FileItem[], formValues?: Partial<T>}) => boolean;

/**
 * Утилита для глубокого сравнения значений с учетом undefined/null и типов
 */
const deepCompare = (val1: unknown, val2: unknown): boolean => {
    // Обработка null и undefined как эквивалентных
    if (val1 == null && val2 == null) return true;
    if (val1 == null || val2 == null) return false;

    // Сравнение массивов
    if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) return false;
        return val1.every((item, index) => deepCompare(item, val2[index]));
    }

    // Сравнение объектов
    if (typeof val1 === 'object' && typeof val2 === 'object') {
        const obj1 = val1 as Record<string, unknown>;
        const obj2 = val2 as Record<string, unknown>;
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        // Получаем все уникальные ключи
        const allKeys = [...new Set([...keys1, ...keys2])];

        return allKeys.every(key => deepCompare(obj1[key], obj2[key]));
    }

    // Примитивное сравнение
    return val1 === val2;
};

/**
 * Хук для определения реальных изменений в форме
 * Решает проблему с isFieldsTouched(), который срабатывает при простом фокусе
 * @param editMode - флаг режима редактирования
 * @param currentData - начальные данные при редактировании
 * @param initialForm - начальные значения формы при создании (опционально)
 * @param currentFiles - текущий список файлов (опционально)
 * @returns функция проверки изменений
 */
export const useCheckFormChanges = <T extends Record<string, unknown>>({
    editMode = false,
    currentData,
    currentFiles,
    initialForm,
}: UseFormChangeDetectionOptions<T>): ResFunc<T> => {

    const checkFormChanges: ResFunc<T> = useCallback(({formFiles, formValues}) => {
        // Если режим редактирования - сравниваем с начальными данными
        if (editMode && currentData) {
            // Поле за полем сравниваем значения
            const hasFormChanges = !deepCompare(formValues, currentData);

            // Проверяем изменения в файлах, если они есть
            if (currentFiles !== undefined && formFiles !== undefined) {
                const hasNewFiles = formFiles.some((f: FileItem) => f.file);
                const currentFileIds = (currentFiles || []).map((f: FileItem) => f.id).sort();
                const formFileIds = formFiles.filter((f: FileItem) => !f.file).map((f: FileItem) => f.id).sort();
                const hasDeletedFiles = JSON.stringify(currentFileIds) !== JSON.stringify(formFileIds);
                const hasFileChanges = hasNewFiles || hasDeletedFiles;

                return hasFormChanges || hasFileChanges;
            }

            return hasFormChanges;
        }

        // Если режим создания с initialForm - сравниваем с начальными значениями
        if (!editMode && initialForm) {
            const hasFormChanges = !deepCompare(formValues, initialForm);

            // Проверяем изменения в файлах, если они есть
            if (formFiles !== undefined) {
                const hasNewFiles = formFiles.some((f: FileItem) => f.file);
                
                return hasFormChanges || hasNewFiles;
            }

            return hasFormChanges;
        }

        // Если режим создания без initialForm - проверяем есть ли хоть какие-то данные
        const hasAnyValue = Object.values(formValues ?? {}).some(value => {
            if (value === undefined || value === null || value === '') {
                return false;
            }
            if (Array.isArray(value) && value.length === 0) {
                return false;
            }
            return true;
        });

        // Проверяем новые файлы при создании
        if (formFiles !== undefined) {
            const hasNewFiles = formFiles.some((f: FileItem) => f.file);
            return hasAnyValue || hasNewFiles;
        }

        return hasAnyValue;
    }, [currentData, currentFiles, editMode, initialForm])

    return checkFormChanges;
};

