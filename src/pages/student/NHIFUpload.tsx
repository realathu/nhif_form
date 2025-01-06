import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaFileUpload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import api from '../../utils/api'

interface UploadResult {
  totalRows: number
  processedRows: number
  errors: string[]
}

const NHIFUpload: React.FC = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload Excel or CSV files.')
      return
    }

    // File size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.')
      return
    }

    const formData = new FormData()
    formData.append('nhifFile', file)

    setIsUploading(true)

    try {
      const response = await api.post('/students/upload-nhif', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const result: UploadResult = response.data
      setUploadResult(result)

      if (result.processedRows > 0) {
        toast.success(`Successfully uploaded ${result.processedRows} out of ${result.totalRows} rows`, {
          duration: 5000,
          position: 'top-center'
        })
      } else {
        toast.error('No rows were successfully processed', {
          duration: 5000,
          position: 'top-center'
        })
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 
        'File upload failed. Please try again.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-primary-600 text-white p-6 text-center">
          <h1 className="text-3xl font-bold">NHIF Information Upload</h1>
          <p className="mt-2 text-primary-100">
            Upload your NHIF registration information
          </p>
        </div>

        <div className="p-8">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />

          <div 
            onClick={triggerFileInput}
            className={`
              border-2 border-dashed 
              ${isUploading 
                ? 'border-yellow-300 bg-yellow-50' 
                : 'border-primary-300 hover:bg-primary-50'
              }
              p-8 rounded-lg cursor-pointer 
              text-center transition
            `}
          >
            <FaFileUpload className="mx-auto text-6xl text-primary-600 mb-4" />
            <p className="text-gray-600 text-lg">
              {isUploading 
                ? 'Uploading...' 
                : 'Click to upload NHIF Excel/CSV file'
              }
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Max file size: 10MB. Supported formats: .xlsx, .xls, .csv
            </p>
          </div>

          {uploadResult && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Upload Results
                </h2>
                {uploadResult.processedRows === uploadResult.totalRows ? (
                  <FaCheckCircle className="text-green-500 text-2xl" />
                ) : (
                  <FaTimesCircle className="text-red-500 text-2xl" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Rows</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {uploadResult.totalRows}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Processed Rows</p>
                  <p className="text-2xl font-bold text-green-600">
                    {uploadResult.processedRows}
                  </p>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    Errors
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-500">
                    {uploadResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NHIFUpload
