/** Number of search results per page */
export const SEARCH_RESULT_PAGE_SIZE = 10
export const getSearchResultPageCount = (results = 0) => Math.ceil(results / SEARCH_RESULT_PAGE_SIZE)
