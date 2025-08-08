import React, { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/sharp-regular-svg-icons";
import FormFields, { getDefaultValue } from "~/components/DBManager/FormFields";
import { useToast } from "~/hooks/use-toast";

const CreateModal = ({
  activeTab,
  closeModals,
  activeTableInfo,
  formData,
  handleInputChange,
  showCreateModal,
}) => {
  const fetcher = useFetcher();
  const { toast } = useToast();

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

  return (
    <>
      {showCreateModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 rounded-xl border shadow-[0px_0px_24px_0px_rgba(163,161,150,0.24)] shadow-[0px_0px_4px_0px_rgba(106,104,93,0.16)]">
          <div className="relative bg-[#FAF9F5] shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border rounded-xl">
            <div className="flex justify-between items-center p-6 border-b bg-[#FAF9F5]">
              <div>
                <div className="flex gap-2 items-center">
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-3.5" />
                  <span className="text-base font-semibold text-[#333129]">
                    Add New Record
                  </span>
                </div>
                <p className="text-[#9E9C92] mt-1 text-xs font-medium">
                  Adding to table:{" "}
                  <span className="font-medium">{activeTab}</span>
                </p>
              </div>
              <button
                onClick={closeModals}
                className="text-[#333129] hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <fetcher.Form
              method="post"
              className="p-6 relative max-h-[calc(90vh_-_100px)]"
            >
              <input type="hidden" name="_action" value="create" />
              <input type="hidden" name="tableName" value={activeTab} />

              <div className="bg-white rounded-xl border p-6 overflow-y-scroll mb-[85px] max-h-[calc(100dvh_-_260px)] pb-[120px]">
                <div className="h-full overflow-scroll grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTableInfo.columns
                    .filter(
                      (column) =>
                        !column.isAutoIncrement &&
                        !(column.isPrimaryKey && column.hasDefault),
                    )
                    .map((column) => (
                      <div key={column.name} className="space-y-2">
                        <label className="block text-sm font-medium text-[#6A685D]">
                          <div className="flex items-center space-x-2">
                            <span>{column.name}</span>
                            {column.isPrimaryKey && (
                              <span
                                className="text-blue-500"
                                title="Primary Key"
                              >
                                🔑
                              </span>
                            )}
                            {column.enumValues && (
                              <span
                                className="text-purple-500"
                                title="Enum Field"
                              >
                                📋
                              </span>
                            )}
                            {column.isNotNull && !column.hasDefault && (
                              <span className="text-red-500" title="Required">
                                *
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {column.type}
                            {column.enumValues && (
                              <span className="ml-2">
                                • Options: {column.enumValues.join(", ")}
                              </span>
                            )}
                          </div>
                        </label>
                        <FormFields
                          value={formData[column.name]}
                          column={column}
                          getDefaultValue={getDefaultValue}
                          handleInputChange={handleInputChange}
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t mt-6 absolute right-0 left-0 bottom-0 bg-[#FAF9F5] pb-6 p-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="w-full px-4 py-2 text-sm font-medium rounded-xl border text-[#333129] bg-[#FAF9F5] hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl w-full px-4 py-2 text-sm font-medium bg-[#FA723C] text-white opacity-90  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={fetcher.state === "submitting"}
                >
                  {fetcher.state === "submitting" ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white opacity-90"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Record"
                  )}
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateModal;
