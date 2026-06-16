 
 
import {
    InputHTMLAttributes,
    ReactNode,
    memo,
    useState,
    useCallback,
    useRef,
    useEffect,
    forwardRef,
} from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { EXCEL_TYPES, IMAGE_TYPES, PDF_TYPES, WORD_TYPES, ZIP_TYPES } from '@/shared/const/const';
import cls from './InputFile.module.scss';

type AcceptedFileTypes = string[];

export interface FileValidationResult {
    validFiles: File[];
    invalidFiles: File[];
    errors: string[];
}

export interface InputFileProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'multiple' | 'accept'> {
    onChange?: (files: FileList | null, validationResult?: FileValidationResult) => void | Promise<void>;
    multiple?: boolean;
    children: ReactNode;
    dragContent?: ReactNode;
    accept?: string | AcceptedFileTypes;
    maxFileSize?: number;
    maxFiles?: number;
    validateFiles?: boolean;
    onValidationError?: (errors: string[]) => void;
}

export const InputFile = memo(forwardRef<HTMLInputElement, InputFileProps>((props, ref) => {
    const {
        onChange,
        multiple = false,
        accept = IMAGE_TYPES.concat(PDF_TYPES, WORD_TYPES, EXCEL_TYPES, ZIP_TYPES).join(','),
        children,
        dragContent,
        className,
        maxFileSize,
        maxFiles,
        validateFiles = true,
        onValidationError,
        ...restProps
    } = props;

    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const actualRef = ref || inputRef;

    // Нормализуем accept в строку
    const normalizedAccept = Array.isArray(accept) ? accept.join(',') : accept;

    // Утилита для создания FileList из массива File
    const createFileListFromArray = useCallback((files: File[]): FileList => {
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        return dt.files;
    }, []);

    // Валидация файлов
    const validateFileList = useCallback((files: FileList): FileValidationResult => {
        const validFiles: File[] = [];
        const invalidFiles: File[] = [];
        const errors: string[] = [];

        if (!validateFiles) {
            return {
                validFiles: Array.from(files),
                invalidFiles: [],
                errors: []
            };
        }

        const acceptedTypes = normalizedAccept
            .split(',')
            .map(type => type.trim().toLowerCase());

        // Проверка количества файлов
        if (multiple && maxFiles && files.length > maxFiles) {
            errors.push(`Максимальное количество файлов: ${maxFiles}`);
        }

        Array.from(files).forEach((file) => {
            let isValid = true;

            // Проверка типа файла
            if (acceptedTypes.length > 0) {
                const fileType = file.type.toLowerCase();
                const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

                const isTypeAccepted = acceptedTypes.some(acceptedType => 
                    fileType === acceptedType || 
                    acceptedType.includes(fileExtension) ||
                    acceptedType.startsWith('.') && fileExtension === acceptedType
                );

                if (!isTypeAccepted) {
                    errors.push(`Неподдерживаемый тип файла: ${file.name}`);
                    isValid = false;
                }
            }

            // Проверка размера файла
            if (maxFileSize && file.size > maxFileSize) {
                const maxSizeMB = (maxFileSize / 1024 / 1024).toFixed(1);
                errors.push(`Файл ${file.name} превышает максимальный размер ${maxSizeMB}MB`);
                isValid = false;
            }

            if (isValid) {
                validFiles.push(file);
            } else {
                invalidFiles.push(file);
            }
        });

        return { validFiles, invalidFiles, errors };
    }, [normalizedAccept, maxFileSize, maxFiles, multiple, validateFiles]);

    // Обработчики drag & drop с исправлением счетчика
    const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(false);

        const { files } = e.dataTransfer;
        if (!files || files.length === 0) return;

        // Проверяем множественный выбор
        if (!multiple && files.length > 1) {
            const error = 'Можно выбрать только один файл';
            onValidationError?.([error]);
            return;
        }

        const validationResult = validateFileList(files);

        if (validationResult.errors.length > 0) {
            onValidationError?.(validationResult.errors);
        }

        // Вызываем onChange с валидными файлами или всеми файлами если валидация отключена
        if (validationResult.validFiles.length > 0 || !validateFiles) {
            const filesToPass = validateFiles ? 
                createFileListFromArray(validationResult.validFiles) : 
                files;
            onChange?.(filesToPass, validationResult);
        }
    }, [multiple, validateFileList, onChange, onValidationError, validateFiles, createFileListFromArray]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!files || files.length === 0) return;

        const validationResult = validateFileList(files);

        if (validationResult.errors.length > 0) {
            onValidationError?.(validationResult.errors);
        }

        // Вызываем onChange с валидными файлами или всеми файлами если валидация отключена
        if (validationResult.validFiles.length > 0 || !validateFiles) {
            const filesToPass = validateFiles ? 
                createFileListFromArray(validationResult.validFiles) : 
                files;
            onChange?.(filesToPass, validationResult);
        }

        // Сбрасываем значение для повторного выбора того же файла
        e.target.value = '';
    }, [validateFileList, onChange, onValidationError, validateFiles, createFileListFromArray]);

    // Сброс состояния drag при размонтировании
    useEffect(() => {
        return () => {
            setIsDragging(false);
        };
    }, []);

    return (
        <label
            className={classNames(
                cls.InputFile,
                [className],
                {
                    [cls.dragging]: isDragging,
                }
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                {...restProps}
                type="file"
                className={cls.input}
                onChange={handleInputChange}
                accept={normalizedAccept}
                multiple={multiple}
                ref={actualRef}
            />
            {isDragging && dragContent ? dragContent : children}
        </label>
    );
}));

InputFile.displayName = 'InputFile';
