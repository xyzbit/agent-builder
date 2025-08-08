import { useFetcher, useNavigation, useSearchParams } from "@remix-run/react";
import React, { useEffect, useMemo, useState } from "react";
import EmptyDB from "~/components/DBManager/EmptyDB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faAngleRight,
  faAngleLeft,
  faPenToSquare,
  faTrash,
} from "@fortawesome/sharp-regular-svg-icons";
import {
  Root as SwitchRoot,
  Thumb as SwitchThumb,
} from "@radix-ui/react-switch";
import { getDefaultValue } from "./FormFields";

import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import IndeterminateCheckbox from "~/components/DBManager/IndeterminateCheckbox";
import Cell from "~/components/DBManager/Cell";
import CreateModal from "~/components/DBManager/CreateModal";
import EditModal from "~/components/DBManager/EditModal";
import { getPrimaryKey } from "~/components/DBManager/helpers";
import LoadingState from "~/components/DBManager/LoadingState";
import ErrorState from "~/components/DBManager/ErrorState";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";

const DBManager = ({ loaderData }) => {
  const fetcher = useFetcher();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const { toast } = useToast();

  const tablesInfo = loaderData?.tablesInfo || [];
  const tablesData = loaderData?.tablesData || {};
  const error = loaderData?.error;
  const errorStack = loaderData?.errorStack;
  const schemaDebugInfo = loaderData?.schemaDebugInfo;
  const tablesCount = loaderData?.tablesCount || 0;

  const [activeTab, setActiveTab] = useState<string>("");
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [activeTableData, setActiveTableData] = useState(tablesData[activeTab]);
  const [activeTableInfo, setActiveTableInfo] = useState(
    tablesInfo.find((t) => t.name === activeTab),
  );

  const [prodDbUrl, setProdDbUrl] = useState("");

  const totalPages = Math.ceil(activeTableInfo?.count / 10);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [showProdDb, setShowProdDb] = useState(!!prodDbUrl);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPaginatedDataLoading, setIsPaginatedDataLoading] = useState(false);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const handleMessage = (event: {
      data: {
        type: string;
        payload: React.SetStateAction<string>;
        origin: string;
      };
    }) => {
      if (event.data?.type === "PROD_INFO") {
        setProdDbUrl(event.data.payload);
        setShowProdDb(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (window?.location?.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const dbUrl = searchParams.get("dbUrl") ?? prodDbUrl;
      const showProd = searchParams.get("showProdDb") === "true";
      setProdDbUrl(dbUrl);
      setShowProdDb(showProd);
    }
  }, []);

  useEffect(() => {
    if (tablesInfo.length > 0 && !activeTab && !isLoading) {
      setActiveTab(tablesInfo[0].name);
    }

    // Set active table data and info when activeTab changes
    if (activeTab && !isLoading) {
      setActiveTableData(tablesData[activeTab]);
      const activeTable = tablesInfo.find((t) => t.name === activeTab);
      setActiveTableInfo(activeTable);
      setPagination({
        pageSize: 10,
        pageIndex: activeTable?.offset / 10,
      });
    }
  }, [tablesInfo, activeTab, tablesData, isLoading]);

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  const handleInputChange = (columnName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  const openCreateModal = () => {
    // Pre-fill form with intelligent defaults
    const initialFormData = {};
    if (activeTableInfo) {
      activeTableInfo.columns
        .filter(
          (column) =>
            !column.isAutoIncrement &&
            !(column.isPrimaryKey && column.hasDefault),
        )
        .forEach((column: any) => {
          const defaultValue = getDefaultValue(column);
          if (defaultValue !== null && defaultValue !== "") {
            initialFormData[column.name] = defaultValue;
          }
        });
    }
    setFormData(initialFormData);
    setShowCreateModal(true);
  };

  const openEditModal = (record: any) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingRecord(null);
    setFormData({});
  };

  useEffect(() => {
    try {
      if (tablesInfo.length > 0 && !activeTab) {
        setActiveTab(tablesInfo[0].name);
      }

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Error in useEffect:", err);
      setIsLoading(false);
    }
  }, [tablesInfo, activeTab]);

  useEffect(() => {
    setIsPaginatedDataLoading(navigation.state === "loading");
  }, [navigation.state]);

  useEffect(() => {
    if (fetcher.data?.success) {
      toast({
        title: "Success",
        description: fetcher?.data?.message,
        duration: 3000,
        className:
          "fixed top-4 right-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-lg z-50 max-w-md text-green-400",
      });
      closeModals();
    }
  }, [fetcher?.data]);

  useEffect(() => {
    if (fetcher?.data?.error) {
      toast({
        title: "Error",
        description: fetcher?.data?.error,
        duration: 3000,
        className:
          "fixed top-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-lg z-50 max-w-md text-red-400",
      });
    }
  }, [fetcher?.data]);

  const primaryKey = activeTableInfo ? getPrimaryKey(activeTableInfo) : null;
  const primaryKeyField = primaryKey;
  const handleEdit = openEditModal;
  const fetcherRef = fetcher;

  const columns: ColumnDef<any>[] = useMemo(() => {
    if (!activeTableInfo) return [];

    return [
      ...activeTableInfo.columns.map((column: any, index: number) => ({
        accessorKey: column.name,
        enableSorting: true,
        header: ({ table }) => (
          <div className="flex gap-2">
            {index === 0 && (
              <IndeterminateCheckbox
                {...{
                  checked: table.getIsAllRowsSelected(),
                  indeterminate: table.getIsSomeRowsSelected(),
                  onChange: table.getToggleAllRowsSelectedHandler(),
                }}
              />
            )}

            <div className="flex items-center space-x-1">
              <span>{column.name}</span>
              {column.isPrimaryKey && <span title="Primary Key">🔑</span>}
              {column.isAutoIncrement && <span title="Auto Increment">⚡</span>}
              {column.enumValues && <span title="Enum">📋</span>}
              {column.isNotNull && !column.hasDefault && (
                <span className="text-red-400 ml-1">*</span>
              )}
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const showCheckbox = index === 0;
          return (
            <div className="flex gap-2">
              {showCheckbox && (
                <IndeterminateCheckbox
                  {...{
                    checked: row.getIsSelected(),
                    disabled: !row.getCanSelect(),
                    indeterminate: row.getIsSomeSelected(),
                    onChange: row.getToggleSelectedHandler(),
                  }}
                />
              )}
              <Cell
                getValue={() => row.getValue(column.name)}
                column={column}
              />
            </div>
          );
        },
      })),
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const record = row.original;
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(record)}
                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                title="Edit Record"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="" />
              </button>
              {primaryKeyField && (
                <fetcherRef.Form method="post" className="inline">
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="tableName" value={activeTab} />
                  <input
                    type="hidden"
                    name="recordId"
                    value={record[primaryKeyField.name]}
                  />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Delete Record"
                    onClick={(e) => {
                      if (
                        !confirm("Are you sure you want to delete this record?")
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </fetcherRef.Form>
              )}
            </div>
          );
        },
      },
    ];
  }, [activeTableInfo, activeTab, primaryKeyField, handleEdit, fetcherRef]);

  const table = useReactTable({
    data: activeTableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      globalFilter,
      pagination,
    },
    pageCount: totalPages,
    globalFilterFn: "auto",
    manualFiltering: true,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  const handleOnSwitchChange = (checked: boolean) => {
    setShowProdDb(checked);
    const currentUrl = new URL(window.location.href);
    if (checked) {
      currentUrl.searchParams.set("dbUrl", prodDbUrl);
      currentUrl.searchParams.set("showProdDb", "true");
      window.location.href = currentUrl.toString();
    } else {
      currentUrl.searchParams.set("showProdDb", "false");
      window.location.href = currentUrl.toString();
    }
  };

  return (
    <div className="p-4 h-full w-full">
      <div
        className={`grid ${!error || tablesCount > 0 ? "grid-cols-4 h-full" : ""}`}
      >
        <div className="col-span-1 items-center border px-2 md:px-5 py-3 min-w-[120px] overflow-hidden">
          <div
            className={`py-4 text-[#9E9C92] justify-start text-xs font-semibold font-inter leading-none gap-1 flex ${!error && tablesCount > 0 ? "border-b border-[#D9D6C7]" : "pb-0"}`}
          >
            <span>Local</span>
            <SwitchRoot
              className="w-6 rounded-full data-[disabled]:bg-gray-300 data-[state=checked]:bg-[#57E777] data-[state=unchecked]:bg-gray-300"
              defaultChecked={false}
              disabled={!prodDbUrl}
              checked={showProdDb}
              onCheckedChange={handleOnSwitchChange}
            >
              <SwitchThumb className="block w-2 h-2 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[14px]" />
            </SwitchRoot>
            <span>Prod</span>
          </div>
          <div className="flex flex-col justify-start items-start gap-4 mt-3">
            {tablesInfo.map((table) => (
              <button
                key={table.name}
                onClick={() => {
                  setActiveTab(table.name);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("offset", "0");
                  newParams.set("search", "");
                  setSearchParams(newParams);
                }}
                className={`inline-block break-all font-inter text-xs font-normal bg-white border-0 text-left ${
                  activeTab === table.name
                    ? "text-blue-600"
                    : "hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {table.name}
                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {table?.count || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
        {error && (
          <ErrorState
            showDebugInfo={showDebugInfo}
            schemaDebugInfo={schemaDebugInfo}
            toggleDebugInfo={toggleDebugInfo}
            errorStack={errorStack}
            error={error}
          />
        )}
        {tablesCount === 0 && !error && (
          <EmptyDB
            schemaDebugInfo={schemaDebugInfo}
            showDebugInfo={showDebugInfo}
            toggleDebugInfo={toggleDebugInfo}
          />
        )}

        {!error && tablesCount > 0 && (
          <div className="border-y border-r pt-3 col-span-3">
            <div className="flex justify-between px-5 gap-2">
              <div className="my-3 min-w-[44px] break-all">
                <div className="justify-start text-[#333129] text-sm font-medium font-inter leading-none">
                  {activeTab}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={openCreateModal}
                  className="flex gap-2.5 items-center border-0 bg-white text-xs font-semibold font-inter leading-none"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-3.5" />
                  Add Record
                </button>

                {/*<button*/}
                {/*  className="flex gap-2.5 items-center border-0 bg-white text-xs font-semibold font-inter leading-none"*/}
                {/*  onClick={() => exportToCSV(tablesData)}*/}
                {/*>*/}
                {/*  <FontAwesomeIcon*/}
                {/*    icon={faArrowDownToBracket}*/}
                {/*    className="w-4 h-3.5"*/}
                {/*  />*/}
                {/*  Export sheet*/}
                {/*</button>*/}
              </div>
            </div>

            <div className="flex items-end gap-10 pt-6 px-5">
              <div className="self-stretch p-1.5 inline-flex justify-start items-center gap-3 border-b w-full">
                <div className="flex gap-3">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="w-4.5 h-4.5 text-zinc-400"
                  />
                  <input
                    className="flex-1 justify-center text-zinc-400 text-sm font-normal leading-tight focus-visible:outline-0"
                    placeholder="Search"
                    onChange={(e) => {
                      table.setGlobalFilter(String(e.target.value));

                      const newParams = new URLSearchParams(searchParams);
                      newParams.set("search", e.target.value);
                      setSearchParams(newParams);
                    }}
                    value={globalFilter ?? ""}
                  />
                </div>
              </div>

              {activeTableData?.length > 0 && (
                <fetcherRef.Form method="post" className="inline">
                  <input type="hidden" name="_action" value="bulk-delete" />
                  <input type="hidden" name="tableName" value={activeTab} />
                  {table.getSelectedRowModel().rows.map((row) => (
                    <input
                      key={row.id}
                      type="hidden"
                      name="recordIds[]"
                      value={row.original[primaryKeyField.name]}
                    />
                  ))}
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-900 hover:bg-red-50"
                    title="Delete Record"
                    onClick={(e) => {
                      if (
                        !confirm("Are you sure you want to delete this record?")
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </fetcherRef.Form>
              )}
            </div>

            {isPaginatedDataLoading && (
              <div className="flex flex-col items-center gap-4 m-auto h-full mt-5">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6A685D] border-dotted"></div>
              </div>
            )}

            {activeTableInfo && !isPaginatedDataLoading && (
              <div className="bg-white border-y mt-5">
                <div className="overflow-x-auto">
                  {activeTableData.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#F7F7F8]">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="px-5 py-3 text-left text-xs font-medium text-[#575F6E] font-['IBM_Plex_Mono'] leading-3"
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-5 py-3 whitespace-nowrap text-zinc-800 text-xs font-normal font-['IBM_Plex_Mono'] leading-none"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center p-8 bg-gray-50">
                      <div className="text-gray-400 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">
                        No data found in this table
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Click "Add Record" to create your first entry
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div className="h-10 inline-flex justify-start items-center gap-3 overflow-hidden w-full bg-[#F7F7F8] font-inter">
                <div className="self-stretch px-4 flex justify-start items-center gap-3">
                  <div className="justify-center text-zinc-400 text-xs font-normal font-inter leading-3">
                    Rows per page
                  </div>
                  <div className="h-6 flex justify-start items-center gap-[3px] font-inter">
                    <div className="justify-center text-zinc-800 text-xs font-medium  leading-3">
                      10
                    </div>
                  </div>
                </div>

                <div className="flex ">
                  {table.getCanPreviousPage() && (
                    <div className="self-stretch px-4 flex justify-start items-center gap-3">
                      <FontAwesomeIcon
                        onClick={() => {
                          table.previousPage();
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set(
                            "offset",
                            String(
                              (table.getState().pagination.pageIndex - 1) * 10,
                            ),
                          );
                          setSearchParams(newParams);
                        }}
                        icon={faAngleLeft}
                        className="w-3 h-3 text-zinc-800"
                      />
                    </div>
                  )}

                  <div className="flex-1 self-stretch px-4 flex justify-center items-center gap-3 font-inter text-xs font-medium leading-3">
                    {pagination.pageIndex + 1} of{" "}
                    {table.getPageCount().toLocaleString()}
                  </div>

                  {table.getCanNextPage() && (
                    <div className="self-stretch px-4 flex justify-start items-center gap-3">
                      <FontAwesomeIcon
                        onClick={() => {
                          table.nextPage();
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set(
                            "offset",
                            String(
                              (table.getState().pagination.pageIndex + 1) * 10,
                            ),
                          );
                          setSearchParams(newParams);
                        }}
                        icon={faAngleRight}
                        className="w-3 h-3 text-zinc-800"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Create Modal */}
      {activeTableInfo && (
        <CreateModal
          closeModals={closeModals}
          activeTableInfo={activeTableInfo}
          activeTab={activeTab}
          formData={formData}
          handleInputChange={handleInputChange}
          showCreateModal={showCreateModal}
        />
      )}

      {/* Enhanced Edit Modal */}
      {showEditModal && activeTableInfo && editingRecord && primaryKey && (
        <EditModal
          closeModals={closeModals}
          activeTableInfo={activeTableInfo}
          activeTab={activeTab}
          formData={formData}
          editingRecord={editingRecord}
          primaryKey={primaryKey}
          handleInputChange={handleInputChange}
        />
      )}

      <Toaster />
    </div>
  );
};

export default DBManager;
