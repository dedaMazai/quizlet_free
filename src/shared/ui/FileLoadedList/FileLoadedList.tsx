import { Button, Upload, Image } from 'antd';
import { RcFile } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';
import {
    EyeOutlined,
    DeleteFilled,
    FileOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { CSSProperties, useCallback, useState } from 'react';
import { HStack, VStack } from '../Stack';
import { FileType } from '@/shared/types/types';
import { MyTypography } from '../MyTypography';
import { downloadFile } from '@/shared/lib/utils';
import { EXCEL_TYPES, IMAGE_TYPES, PDF_TYPES, WORD_TYPES, ZIP_TYPES } from '@/shared/const/const';
import { FileViewerModal } from '../FileViewerModal';
import { getViewerType } from '@/shared/lib/fileTypes';

export const FileLoadedList = ({
    files,
    disabled,
    withUpload = true,
    deleteFile,
    beforeUpload,
    accept = EXCEL_TYPES.concat(WORD_TYPES, PDF_TYPES, IMAGE_TYPES, ZIP_TYPES).join(','),
    style,
    multiple,
    withCrop,
}: {
    files?: FileType[]
    disabled?: boolean
    withUpload?: boolean
    deleteFile?: (id: number) => void
    beforeUpload?: (file: RcFile, fileList: RcFile[]) => void
    accept?: string
    style?: CSSProperties
    multiple?: boolean
    withCrop?: boolean
}) => {
    const { t } = useTranslation();
    const [viewerState, setViewerState] = useState<{
        isOpen: boolean;
        fileUrl: string;
        filename: string;
    }>({
        isOpen: false,
        fileUrl: '',
        filename: '',
    });

    const uploader = withCrop ? (
        <ImgCrop
            quality={1}
            rotationSlider
            aspect={2/3}
            aspectSlider
            beforeCrop={(file: { type: string; }) => {
                if (file.type.split('/')[0] === 'image') {
                    return true;
                }
                return false;
            }}
        >
            <Upload
                name="image"
                listType="picture-card"
                showUploadList={false}
                action="/upload.do"
                accept={accept}
                multiple={multiple}
                beforeUpload={beforeUpload}
            >
                <VStack max align="center">
                    <PlusOutlined />
                    <MyTypography.Base>
                        {t('Загрузить')}
                    </MyTypography.Base>
                </VStack>
            </Upload>
        </ImgCrop>
    ) : (
        <Upload
            name="image"
            listType="picture-card"
            showUploadList={false}
            action="/upload.do"
            accept={accept}
            multiple={multiple}
            beforeUpload={beforeUpload}
        >
            <VStack max align="center">
                <PlusOutlined />
                <MyTypography.Base>
                    {t('Загрузить')}
                </MyTypography.Base>
            </VStack>
        </Upload>
    );

    const handleViewFile = useCallback((fileUrl: string, filename: string) => {
        setViewerState({
            isOpen: true,
            fileUrl,
            filename,
        });
    }, []);

    const handleCloseViewer = useCallback(() => {
        setViewerState(prev => ({
            ...prev,
            isOpen: false,
        }));
    }, []);

    return (
        <HStack gap="8" max wrap style={style}>
            <Image.PreviewGroup>
                {files?.map(({ url, id, file, type, name }) => {
                    const isImg = (type === undefined || type?.split('/')?.[0] === 'image') && url;

                    return (
                        <div
                            style={{
                                border: `1px solid ${isImg ? 'var(--border-light)' : 'var(--color-error)'}`,
                                borderRadius: 6,
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                            key={id}
                        >
                            {
                                isImg ? (
                                    <Image
                                        style={{
                                            height: 100,
                                            objectFit: 'cover'
                                        }}
                                        src={url}
                                        preview={{
                                            mask: <EyeOutlined />
                                        }}
                                    />
                                ) : (
                                    <VStack
                                        justify='center'
                                        align='center'
                                        gap="6"
                                        style={{
                                            height: 100,
                                            width: 100,
                                            padding: 12,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            // if (url) {
                                            //     downloadImageFromSrc(url, file?.name || name);
                                            // } else if (file) {
                                            //     downloadFile(URL.createObjectURL(file), file.name)
                                            // }
                                            if (url) {
                                                handleViewFile(url, file?.name || name || '')
                                            } else if (file) {
                                                const isPdf = getViewerType(file.name || '') === 'pdf';

                                                if (isPdf) {
                                                    handleViewFile(URL.createObjectURL(file), file.name || '')
                                                } else {
                                                    downloadFile(URL.createObjectURL(file), file.name)
                                                }
                                            }
                                        }}
                                    >
                                        <FileOutlined style={{ color: 'var(--color-error)', fontSize: 24 }} />
                                        <MyTypography.Small
                                            strong
                                            style={{ maxHeight: 38, overflow: 'hidden', textAlign: 'center' }}
                                        >
                                            {file?.name || name}
                                        </MyTypography.Small>
                                    </VStack>
                                )
                            }
                            {deleteFile && !disabled && (
                                <Button
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFile(id)
                                    }}
                                    icon={<DeleteFilled />}
                                    size="small"
                                    color="danger"
                                    variant="filled"
                                />
                            )}
                        </div>
                    )
                })}
            </Image.PreviewGroup>
            {withUpload && !disabled && uploader}
            <FileViewerModal
                isOpen={viewerState.isOpen}
                onClose={handleCloseViewer}
                fileUrl={viewerState.fileUrl}
                filename={viewerState.filename}
            />
        </HStack>
    )
}