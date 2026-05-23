import { useState, useCallback } from 'react';
import { reportService } from '../lib/reportService';

export function useReports() {
  const [reports, setReports] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getAll(params);
      setReports(data);
      return data;
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        typeof raw === 'string'
          ? raw
          : raw?.message || 'Failed to load reports.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReportById = useCallback(async (reportId) => {
    setIsDetailsLoading(true);
    setError(null);
    try {
      const data = await reportService.getById(reportId);
      setSelectedReport(data);
      return data;
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        typeof raw === 'string'
          ? raw
          : raw?.message || 'Failed to load report details.';
      setError(message);
      throw err;
    } finally {
      setIsDetailsLoading(false);
    }
  }, []);

  const updateReportStatus = useCallback(async (reportId, status) => {
    setIsUpdatingStatus(true);
    setError(null);
    try {
      const data = await reportService.updateStatus(reportId, { status });

      setReports((prev) => ({
        ...prev,
        items: prev.items.map((report) =>
          report.reportsID === reportId
            ? { ...report, status }
            : report
        ),
      }));

      setSelectedReport((prev) =>
        prev?.reportsID === reportId
          ? { ...prev, status }
          : prev
      );

      return data;
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        typeof raw === 'string'
          ? raw
          : raw?.message || 'Failed to update report status.';
      setError(message);
      throw err;
    } finally {
      setIsUpdatingStatus(false);
    }
  }, []);

  const deleteReport = useCallback(async (reportId) => {
    setError(null);
    try {
      await reportService.delete(reportId);

      setReports((prev) => ({
        ...prev,
        items: prev.items.filter((report) => report.reportsID !== reportId),
        totalCount: Math.max((prev.totalCount || 0) - 1, 0),
      }));

      setSelectedReport((prev) =>
        prev?.reportsID === reportId ? null : prev
      );
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        typeof raw === 'string'
          ? raw
          : raw?.message || 'Failed to delete report.';
      setError(message);
      throw err;
    }
  }, []);

  const exportReports = useCallback(async (params = {}, format = 'csv') => {
    try {
      return await reportService.exportReports(params, format);
    } catch (err) {
      setError('Failed to export reports.');
      throw err;
    }
  }, []);

  const importReports = useCallback(async (file, format = 'csv') => {
    setError(null);
    try {
      return await reportService.importReports(file, format);
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        typeof raw === 'string'
          ? raw
          : raw?.message || 'Failed to import reports.';
      setError(message);
      throw err;
    }
  }, []);

  return {
    reports,
    selectedReport,
    isLoading,
    isDetailsLoading,
    isUpdatingStatus,
    error,
    fetchReports,
    fetchReportById,
    updateReportStatus,
    deleteReport,
    setSelectedReport,
    exportReports,
    importReports,
  };
}