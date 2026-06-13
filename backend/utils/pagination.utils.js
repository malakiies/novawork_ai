const { PAGINATION } = require('../config/constants');

/**
 * Construit les options de pagination depuis req.query
 * @returns { page, limit, skip, sort }
 */
const getPaginationOptions = (query) => {
  const page  = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip  = (page - 1) * limit;
  const sort  = query.sort || '-createdAt';

  return { page, limit, skip, sort };
};

/**
 * Construit la réponse paginée
 */
const buildPaginatedResponse = (data, total, page, limit) => {
  const totalPages  = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
};

module.exports = { getPaginationOptions, buildPaginatedResponse };
