import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProposals } from '../../hooks/useProposals';
import { useContracts } from '../../hooks/useContracts';
import ProposalSearchFilter from '../../components/SearchFilters/ProposalSearchFilter';
import ContractSearchFilter from '../../components/SearchFilters/ContractSearchFilter';

const PROPOSAL_STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Accepted: 'bg-teal-50 text-teal-700 border-teal-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const CONTRACT_STATUS_STYLES = {
  Active: 'bg-teal-50 text-teal-700 border-teal-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const TABS = ['Proposals', 'Contracts'];

export default function MyWorkPage() {
  const [tab, setTab] = useState('Proposals');
  const [proposalPage, setProposalPage] = useState(1);
  const [contractPage, setContractPage] = useState(1);
  const [proposalFilters, setProposalFilters] = useState({});
  const [contractFilters, setContractFilters] = useState({});
  const [proposalFormat, setProposalFormat] = useState('csv');
  const [isExportingProposals, setIsExportingProposals] = useState(false);
  const [isImportingProposals, setIsImportingProposals] = useState(false);
  const proposalFileInputRef = useRef(null);

  const {
    proposals,
    isLoading: proposalsLoading,
    fetchProposals,
    exportProposals,
    importProposals,
    error: proposalError,
  } = useProposals();

  const {
    contracts,
    isLoading: contractsLoading,
    fetchContracts,
  } = useContracts();

  useEffect(() => {
    if (tab === 'Proposals') {
      fetchProposals({
        page: proposalPage,
        pageSize: 10,
        ...proposalFilters,
      });
    }
  }, [tab, proposalPage, proposalFilters, fetchProposals]);

  useEffect(() => {
    if (tab === 'Contracts') {
      fetchContracts({
        page: contractPage,
        pageSize: 10,
        ...contractFilters,
      });
    }
  }, [tab, contractPage, contractFilters, fetchContracts]);

  const proposalItems = proposals?.items ?? [];
  const contractItems = contracts?.items ?? contracts ?? [];

  const handleProposalSearch = (filters) => {
    setProposalFilters(filters);
    setProposalPage(1);
  };

  const handleContractSearch = (filters) => {
    setContractFilters(filters);
    setContractPage(1);
  };

  const handleProposalExport = async () => {
    try {
      setIsExportingProposals(true);

      const response = await exportProposals(
        {
          page: proposalPage,
          pageSize: 10,
          ...proposalFilters,
        },
        proposalFormat
      );

      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const disposition = response.headers['content-disposition'];
      const match = disposition?.match(/filename="?([^"]+)"?/);
      a.download = match?.[1] || `proposals.${proposalFormat === 'excel' ? 'xlsx' : proposalFormat}`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export proposals.');
    } finally {
      setIsExportingProposals(false);
    }
  };

  const handleProposalImportClick = () => {
    proposalFileInputRef.current?.click();
  };

  const handleProposalImportFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImportingProposals(true);

      const result = await importProposals(file, proposalFormat);

      alert(
        `Import finished.\nTotal: ${result.totalRows}\nImported: ${result.importedRows}\nFailed: ${result.failedRows}`
      );

      await fetchProposals({
        page: proposalPage,
        pageSize: 10,
        ...proposalFilters,
      });
    } catch (err) {
      console.error(err);
      alert('Failed to import proposals.');
    } finally {
      e.target.value = '';
      setIsImportingProposals(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">My Work</h1>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        {TABS.map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            className={`px-4 py-2 font-medium transition-colors ${
              tab === tabName
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tabName}
          </button>
        ))}
      </div>

      {tab === 'Proposals' && (
        <div>
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <ProposalSearchFilter onSearch={handleProposalSearch} />

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={proposalFormat}
                onChange={(e) => setProposalFormat(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="excel">Excel</option>
              </select>

              <button
                onClick={handleProposalExport}
                disabled={isExportingProposals}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                {isExportingProposals ? 'Exporting...' : 'Export'}
              </button>

              <button
                onClick={handleProposalImportClick}
                disabled={isImportingProposals}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                {isImportingProposals ? 'Importing...' : 'Import'}
              </button>

              <input
                ref={proposalFileInputRef}
                type="file"
                accept={
                  proposalFormat === 'excel'
                    ? '.xlsx'
                    : proposalFormat === 'json'
                    ? '.json'
                    : '.csv'
                }
                className="hidden"
                onChange={handleProposalImportFileChange}
              />
            </div>
          </div>

          {proposalError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {proposalError}
            </div>
          )}

          {proposalsLoading && proposalItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Loading proposals...</div>
          ) : proposalItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No proposals found.</div>
          ) : (
            <div className="space-y-4">
              {proposalItems.map((proposal) => (
                <div
                  key={proposal.proposalId}
                  className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{proposal.projectTitle}</h3>
                      <p className="text-slate-600 text-sm mt-1">{proposal.message}</p>
                      <div className="flex gap-4 mt-3 text-sm text-slate-600 flex-wrap">
                        <span>Bid: ${proposal.bidAmount}</span>
                        <span>Delivery: {proposal.deliveryDays} days</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${PROPOSAL_STATUS_STYLES[proposal.status] || ''}`}>
                          {proposal.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {proposals?.totalCount > 10 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={proposalPage === 1}
                onClick={() => setProposalPage((p) => p - 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-slate-600">Page {proposalPage}</span>
              <button
                disabled={proposalPage * 10 >= (proposals?.totalCount || 0)}
                onClick={() => setProposalPage((p) => p + 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'Contracts' && (
        <div>
          <ContractSearchFilter onSearch={handleContractSearch} />

          {contractsLoading && contractItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Loading contracts...</div>
          ) : contractItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No contracts found.</div>
          ) : (
            <div className="space-y-4">
              {contractItems.map((contract) => (
                <div
                  key={contract.contractID}
                  className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{contract.projectTitle}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-slate-600">
                        <span>${contract.agreedPrice?.toFixed(2)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${CONTRACT_STATUS_STYLES[contract.status] || ''}`}>
                          {contract.status}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/contracts/${contract.contractID}`}
                      className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {contracts?.totalCount > 10 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={contractPage === 1}
                onClick={() => setContractPage((p) => p - 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-slate-600">Page {contractPage}</span>
              <button
                disabled={contractPage * 10 >= (contracts?.totalCount || 0)}
                onClick={() => setContractPage((p) => p + 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}