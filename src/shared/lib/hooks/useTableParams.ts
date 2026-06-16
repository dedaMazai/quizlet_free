import { TableProps } from "antd";
import { TableRowSelection, FilterValue, SorterResult } from "antd/es/table/interface";
import { TablePaginationConfig } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";
import { TableParams } from "@/shared/types/types";

interface DataType {
    isSeparator?: boolean
    key: string | number
}

const initialTableParams = {
    pagination: {
        current: 1,
        pageSize: 10,
        total: 10,
    },
};

export const useTableParams = <T extends DataType>(props?: {
    selectOnlyOne?: boolean,
}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
    const [tableParams, setTableParams] = useState<TableParams>(initialTableParams);

    // const setTotal = useCallback((total: number) => {
    //     setTableParams((prev) => ({
    //         ...prev,
    //         pagination: {
    //             ...prev.pagination,
    //             total,
    //         },
    //     }));
    // }, [])

    const rowSelection: TableRowSelection<T> = useMemo(() => ({
        type: props?.selectOnlyOne ? 'radio' : 'checkbox',
        selectedRowKeys,
        // @ts-ignore — antd renderCell type doesn't match our custom DataType with isSeparator
        renderCell: (_, value, index, Node) => {
            if (value.isSeparator) {
                return null;
            }

            return Node;
        },
        onSelect: (row, selected) => {
            if (props?.selectOnlyOne) {
                setSelectedRowKeys([row.key]);
                return;
            }

            if (selected) {
                setSelectedRowKeys((prev) => [...prev, row.key]);
            } else {
                setSelectedRowKeys((prev) =>
                    prev.filter((el) => el !== row.key),
                );
            }
        },
        onSelectAll: (_, selectedRows, changeRows) => {
            if (props?.selectOnlyOne) {
                setSelectedRowKeys([]);
                return;
            }

            const changeRowsSeparator = changeRows
                .filter(({ isSeparator }) => !!isSeparator)
                .map(({ key }) => key);
            const selectedKeys = selectedRows
                .filter(({ isSeparator }) => !isSeparator)
                .map(({ key }) => key);

            if (changeRowsSeparator.length === changeRows.length) {
                setSelectedRowKeys([]);
            } else {
                setSelectedRowKeys(selectedKeys);
            }
        },
    }), [props?.selectOnlyOne, selectedRowKeys]);

    const handleTableChange: TableProps<T>['onChange'] = useCallback((
        _pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<T> | SorterResult<T>[],
    ) => {
        setTableParams((prev) => ({
            ...prev,
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
            pagination: {
                ...prev.pagination,
                current: 1,
            },
        }));
    }, []);

    const clearTableParams = useCallback(() => {
        setSelectedRowKeys([]);
        setTableParams(initialTableParams);
    }, [])

    return {
        // setTotal,
        tableParams,
        selectedRowKeys,
        setTableParams,
        rowSelection,
        handleTableChange,
        setSelectedRowKeys,
        clearTableParams,
    }
};