namespace LabCourse2.Application.Interfaces.AI
{
    public interface IAIMatchingExportService
    {
        Task<byte[]> ExportFreelancersCsvAsync();
        Task<byte[]> ExportProjectsCsvAsync();
        Task<byte[]> ExportPositivePairsCsvAsync();
        Task<byte[]> ExportMatchingTrainingCsvAsync();
    }
}