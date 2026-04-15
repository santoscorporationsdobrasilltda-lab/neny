import React from 'react';
import { Loader2 } from 'lucide-react';

const DataTable = ({ columns, data, loading, onRowClick, emptyMessage = "Nenhum registro encontrado." }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center p-8 bg-white rounded-xl border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={`p-4 ${col.align === 'right' ? 'text-right' : ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr 
                                    key={row.id || rowIdx} 
                                    className={`hover:bg-slate-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`p-4 ${col.align === 'right' ? 'text-right' : ''}`}>
                                            {col.cell ? col.cell(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;