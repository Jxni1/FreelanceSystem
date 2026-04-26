namespace LabCourse2.Application.Common
{
    public class Result<T>
    {
        public bool IsSuccess { get; private set; }
        public T? Data { get; private set; }
        public string? Error { get; private set; }
        public int StatusCode { get; private set; }

        private Result(bool isSuccess, T? data, string? error, int statusCode)
        {
            IsSuccess = isSuccess;
            Data = data;
            Error = error;
            StatusCode = statusCode;
        }

        public static Result<T> Success(T data) => new(true, data, null, 200);
        public static Result<T> Created(T data) => new(true, data, null, 201);
        public static Result<T> Failure(string error) => new(false, default, error, 400);
        public static Result<T> NotFound(string error) => new(false, default, error, 404);
        public static Result<T> Forbidden(string error) => new(false, default, error, 403);
        public static Result<T> Unauthorized(string error) => new(false, default, error, 401);
        public static Result<T> Conflict(string error) => new(false, default, error, 409);
    }
}