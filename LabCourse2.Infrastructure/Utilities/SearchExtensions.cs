using LabCourse2.Domain.Entities;
using System.Linq.Expressions;

namespace LabCourse2.Application.Utilities
{
    public static class SearchExtensions
    {
        public static IQueryable<Project> SearchProjects(
            this IQueryable<Project> query,
            string? searchText,
            string? searchFields = "title,description")
        {
            if (string.IsNullOrWhiteSpace(searchText))
                return query;

            var searchTerms = searchText.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var fields = (searchFields ?? "title,description").Split(',', StringSplitOptions.RemoveEmptyEntries);

            foreach (var term in searchTerms)
            {
                var predicates = new List<Expression<Func<Project, bool>>>();

                if (fields.Contains("title"))
                    predicates.Add(p => p.Title.Contains(term));

                if (fields.Contains("description"))
                    predicates.Add(p => p.Description.Contains(term));

                if (predicates.Any())
                {
                    var combined = CombineOrPredicates(predicates);
                    query = query.Where(combined);
                }
            }

            return query;
        }

        public static IQueryable<Project> FilterByBudgetRange(
            this IQueryable<Project> query,
            decimal? minBudget,
            decimal? maxBudget)
        {
            if (minBudget.HasValue)
                query = query.Where(p => p.Budget >= minBudget.Value);

            if (maxBudget.HasValue)
                query = query.Where(p => p.Budget <= maxBudget.Value);

            return query;
        }

        public static IQueryable<Project> SortProjects(
            this IQueryable<Project> query,
            string? sortBy = "createdAt",
            string? sortOrder = "desc")
        {
            var isDescending = sortOrder?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "budget" => isDescending ? query.OrderByDescending(p => p.Budget) : query.OrderBy(p => p.Budget),
                "title" => isDescending ? query.OrderByDescending(p => p.Title) : query.OrderBy(p => p.Title),
                "updatedat" => isDescending ? query.OrderByDescending(p => p.UpdatedAt) : query.OrderBy(p => p.UpdatedAt),
                _ => isDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            };
        }

        public static IQueryable<Contract> SearchContracts(
            this IQueryable<Contract> query,
            string? description)
        {
            if (string.IsNullOrWhiteSpace(description))
                return query;

            return query.Where(c => c.Description.Contains(description));
        }

        public static IQueryable<Contract> FilterByDateRange(
            this IQueryable<Contract> query,
            DateTime? startDateFrom,
            DateTime? startDateTo,
            DateTime? endDateFrom,
            DateTime? endDateTo)
        {
            if (startDateFrom.HasValue)
                query = query.Where(c => c.Start_Date >= startDateFrom.Value);

            if (startDateTo.HasValue)
                query = query.Where(c => c.Start_Date <= startDateTo.Value);

            if (endDateFrom.HasValue)
                query = query.Where(c => c.End_Date >= endDateFrom.Value);

            if (endDateTo.HasValue)
                query = query.Where(c => c.End_Date <= endDateTo.Value);

            return query;
        }

        public static IQueryable<Contract> FilterByPriceRange(
            this IQueryable<Contract> query,
            decimal? minPrice,
            decimal? maxPrice)
        {
            if (minPrice.HasValue)
                query = query.Where(c => c.Agreed_Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(c => c.Agreed_Price <= maxPrice.Value);

            return query;
        }

        public static IQueryable<Contract> SortContracts(
            this IQueryable<Contract> query,
            string? sortBy = "startDate",
            string? sortOrder = "desc")
        {
            var isDescending = sortOrder?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "enddate" => isDescending ? query.OrderByDescending(c => c.End_Date) : query.OrderBy(c => c.End_Date),
                "price" => isDescending ? query.OrderByDescending(c => c.Agreed_Price) : query.OrderBy(c => c.Agreed_Price),
                "status" => isDescending ? query.OrderByDescending(c => c.Status) : query.OrderBy(c => c.Status),
                _ => isDescending ? query.OrderByDescending(c => c.Start_Date) : query.OrderBy(c => c.Start_Date),
            };
        }

        public static IQueryable<Proposal> SearchProposals(
            this IQueryable<Proposal> query,
            string? message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return query;

            return query.Where(p => p.Message.Contains(message));
        }

        public static IQueryable<Proposal> FilterByBidRange(
            this IQueryable<Proposal> query,
            decimal? minBid,
            decimal? maxBid)
        {
            if (minBid.HasValue)
                query = query.Where(p => p.BidAmount >= minBid.Value);

            if (maxBid.HasValue)
                query = query.Where(p => p.BidAmount <= maxBid.Value);

            return query;
        }

        public static IQueryable<Proposal> FilterByDeliveryDays(
            this IQueryable<Proposal> query,
            int? minDays,
            int? maxDays)
        {
            if (minDays.HasValue)
                query = query.Where(p => p.DeliveryDays >= minDays.Value);

            if (maxDays.HasValue)
                query = query.Where(p => p.DeliveryDays <= maxDays.Value);

            return query;
        }

        public static IQueryable<Proposal> SortProposals(
            this IQueryable<Proposal> query,
            string? sortBy = "createdAt",
            string? sortOrder = "desc")
        {
            var isDescending = sortOrder?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "bidamount" => isDescending ? query.OrderByDescending(p => p.BidAmount) : query.OrderBy(p => p.BidAmount),
                "deliverydays" => isDescending ? query.OrderByDescending(p => p.DeliveryDays) : query.OrderBy(p => p.DeliveryDays),
                "status" => isDescending ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
                _ => isDescending ? query.OrderByDescending(p => p.Created_at) : query.OrderBy(p => p.Created_at),
            };
        }

        public static IQueryable<Review> SearchReviews(
            this IQueryable<Review> query,
            string? comment)
        {
            if (string.IsNullOrWhiteSpace(comment))
                return query;

            return query.Where(r => r.Comment.Contains(comment));
        }

        public static IQueryable<Review> FilterByRatingRange(
            this IQueryable<Review> query,
            int? minRating,
            int? maxRating)
        {
            if (minRating.HasValue)
                query = query.Where(r => r.Rating >= minRating.Value);

            if (maxRating.HasValue)
                query = query.Where(r => r.Rating <= maxRating.Value);

            return query;
        }

        public static IQueryable<Review> SortReviews(
            this IQueryable<Review> query,
            string? sortBy = "createdAt",
            string? sortOrder = "desc")
        {
            var isDescending = sortOrder?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "rating" => isDescending ? query.OrderByDescending(r => r.Rating) : query.OrderBy(r => r.Rating),
                _ => isDescending ? query.OrderByDescending(r => r.Created_at) : query.OrderBy(r => r.Created_at),
            };
        }

        private static Expression<Func<T, bool>> CombineOrPredicates<T>(
            List<Expression<Func<T, bool>>> predicates)
        {
            if (!predicates.Any())
                throw new ArgumentException("Predicates collection is empty");

            var param = Expression.Parameter(typeof(T));
            Expression? body = null;

            foreach (var predicate in predicates)
            {
                var invokedExpr = Expression.Invoke(predicate, param);
                body = body == null ? invokedExpr : Expression.OrElse(body, invokedExpr);
            }

            return Expression.Lambda<Func<T, bool>>(body!, param);
        }
    }
}