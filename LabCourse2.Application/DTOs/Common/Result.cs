namespace LabCourse2.Application.DTOs.Common
{
    public class Result<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? ErrorMessage { get; set; }
        public List<string>? Errors { get; set; }

        public static Result<T> SuccessResult(T data)
        {
            return new Result<T>
            {
                Success = true,
                Data = data,
                ErrorMessage = null,
                Errors = null
            };
        }

        public static Result<T> FailureResult(string errorMessage)
        {
            return new Result<T>
            {
                Success = false,
                Data = default,
                ErrorMessage = errorMessage,
                Errors = null
            };
        }

        public static Result<T> FailureResult(List<string> errors)
        {
            return new Result<T>
            {
                Success = false,
                Data = default,
                ErrorMessage = "Validation failed",
                Errors = errors
            };
        }
    }
}
