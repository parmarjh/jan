import React from "react";
import { DownloadState } from "@/_models/DownloadState";
import {
  formatDownloadPercentage,
  formatDownloadSpeed,
  toGigabytes,
} from "@/_utils/converter";

type Props = {
  downloadState: DownloadState;
};

const ModelDownloadingRow: React.FC<Props> = ({ downloadState }) => (
  <tr
    className="border-b border-gray-200 last:border-b-0 last:rounded-lg"
    key={downloadState.fileName}
  >
    <td className="flex flex-col whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
      {downloadState.fileName}
      <span className="text-gray-500 font-normal">model.version</span>
    </td>
    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
      {toGigabytes(downloadState.size.transferred)}
    </td>
    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
      {toGigabytes(downloadState.size.total)}
    </td>
    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
      {formatDownloadPercentage(downloadState.percent)}
    </td>
    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
      {formatDownloadSpeed(downloadState.speed)}
    </td>
  </tr>
);

export default ModelDownloadingRow;
