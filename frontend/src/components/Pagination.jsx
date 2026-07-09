import React from 'react';

const Pagination = ({ totalCount, limit, offset, onPageChange }) => {
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    if (totalPages <= 1 && totalCount > 0) return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-border mt-4">
            <p className="text-sm text-on-surface-variant">
                Showing <span className="font-medium">{totalCount}</span> entries
            </p>
        </div>
    );
    
    if (totalCount === 0) return null;

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(offset - limit);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(offset + limit);
        }
    };

    const handlePageClick = (pageNumber) => {
        onPageChange((pageNumber - 1) * limit);
    };

    // Calculate page numbers to display
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage - 1 <= 2) {
        endPage = Math.min(totalPages, 5);
    }
    if (totalPages - currentPage <= 2) {
        startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-border mt-4">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-on-surface-variant">
                        Showing <span className="font-medium">{Math.min(offset + 1, totalCount)}</span> to <span className="font-medium">{Math.min(offset + limit, totalCount)}</span> of <span className="font-medium">{totalCount}</span> entries
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-surface text-sm font-medium ${
                                currentPage === 1 ? 'text-on-surface-variant/50 cursor-not-allowed' : 'text-on-surface hover:bg-surface-variant'
                            }`}
                        >
                            <span className="sr-only">Previous</span>
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        
                        {startPage > 1 && (
                            <>
                                <button
                                    onClick={() => handlePageClick(1)}
                                    className="relative inline-flex items-center px-4 py-2 border border-border bg-surface text-sm font-medium text-on-surface hover:bg-surface-variant"
                                >
                                    1
                                </button>
                                {startPage > 2 && (
                                    <span className="relative inline-flex items-center px-4 py-2 border border-border bg-surface text-sm font-medium text-on-surface-variant">
                                        ...
                                    </span>
                                )}
                            </>
                        )}

                        {pageNumbers.map(number => (
                            <button
                                key={number}
                                onClick={() => handlePageClick(number)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === number
                                        ? 'z-10 bg-primary border-primary text-on-primary'
                                        : 'bg-surface border-border text-on-surface hover:bg-surface-variant'
                                }`}
                            >
                                {number}
                            </button>
                        ))}

                        {endPage < totalPages && (
                            <>
                                {endPage < totalPages - 1 && (
                                    <span className="relative inline-flex items-center px-4 py-2 border border-border bg-surface text-sm font-medium text-on-surface-variant">
                                        ...
                                    </span>
                                )}
                                <button
                                    onClick={() => handlePageClick(totalPages)}
                                    className="relative inline-flex items-center px-4 py-2 border border-border bg-surface text-sm font-medium text-on-surface hover:bg-surface-variant"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-surface text-sm font-medium ${
                                currentPage === totalPages ? 'text-on-surface-variant/50 cursor-not-allowed' : 'text-on-surface hover:bg-surface-variant'
                            }`}
                        >
                            <span className="sr-only">Next</span>
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </nav>
                </div>
            </div>
            
            {/* Mobile view */}
            <div className="flex items-center justify-between w-full sm:hidden">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md ${
                        currentPage === 1 ? 'text-on-surface-variant/50 bg-surface cursor-not-allowed' : 'text-on-surface bg-surface hover:bg-surface-variant'
                    }`}
                >
                    Previous
                </button>
                <span className="text-sm text-on-surface-variant">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md ${
                        currentPage === totalPages ? 'text-on-surface-variant/50 bg-surface cursor-not-allowed' : 'text-on-surface bg-surface hover:bg-surface-variant'
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
