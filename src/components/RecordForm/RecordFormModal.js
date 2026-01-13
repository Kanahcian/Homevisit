import React, { useState, useEffect } from 'react';
import './RecordFormModal.css';
import { createRecord, updateRecord, deleteRecord } from '../../services/api';

const RecordFormModal = ({
  record = null,
  locationId,
  onRecordSaved,
  onRecordDeleted,
  onClose
}) => {
  const [formData, setFormData] = useState({
    semester: '',
    date: '',
    photo: '',
    description: '',
    location_id: locationId || '',
    account_id: 1 // 默認值，可以根據需要修改
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 保存原始記錄數據用於比較
  const [originalData, setOriginalData] = useState(null);

  // 如果是編輯模式，初始化表單數據
  useEffect(() => {
    if (record) {
      // 確保日期格式為 YYYY-MM-DD
      let dateValue = record.rawDate || record.date || '';

      // 如果日期格式不正確，嘗試轉換
      if (dateValue && !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        console.warn('日期格式不正確:', dateValue);
        // 嘗試解析日期
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          dateValue = parsedDate.toISOString().split('T')[0];
        } else {
          dateValue = '';
        }
      }

      const initialData = {
        semester: record.semester || '',
        date: dateValue,
        photo: record.photo || '',
        // 如果 description 是 "無訪視筆記"，當作空字串處理
        description: (record.description && record.description !== '無訪視筆記') ? record.description : '',
        location_id: locationId || '',
        account_id: record.account_id || 1
      };

      setFormData(initialData);
      // 保存原始數據
      setOriginalData(initialData);
    }
  }, [record, locationId]);

  // 處理表單輸入變化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 驗證表單
  const validateForm = () => {
    // 對於新建記錄，學期和日期是必填的
    if (!record) {
      if (!formData.semester.trim()) {
        setError('請輸入學期');
        return false;
      }
      if (!formData.date) {
        setError('請選擇日期');
        return false;
      }
    }

    // location_id 始終必須存在
    if (!formData.location_id) {
      setError('地點 ID 不可為空');
      return false;
    }

    return true;
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 準備提交的數據
      const dataToSubmit = {};

      // 對於更新操作，只發送有變化的欄位
      if (record && record.recordId && originalData) {
        // 檢查並添加已變更的欄位
        const trimmedSemester = formData.semester ? formData.semester.trim() : '';
        const originalSemester = originalData.semester ? originalData.semester.trim() : '';
        if (trimmedSemester !== originalSemester && trimmedSemester) {
          dataToSubmit.semester = trimmedSemester;
        }

        if (formData.date !== originalData.date && formData.date) {
          dataToSubmit.date = formData.date;
        }

        const trimmedPhoto = formData.photo ? formData.photo.trim() : '';
        const originalPhoto = originalData.photo ? originalData.photo.trim() : '';
        if (trimmedPhoto !== originalPhoto && trimmedPhoto) {
          dataToSubmit.photo = trimmedPhoto;
        }

        const trimmedDescription = formData.description ? formData.description.trim() : '';
        const originalDescription = originalData.description ? originalData.description.trim() : '';
        if (trimmedDescription !== originalDescription && trimmedDescription) {
          dataToSubmit.description = trimmedDescription;
        }

        console.log('變更檢測:', {
          semester: { original: originalSemester, new: trimmedSemester, changed: trimmedSemester !== originalSemester },
          date: { original: originalData.date, new: formData.date, changed: formData.date !== originalData.date },
          photo: { original: originalPhoto, new: trimmedPhoto, changed: trimmedPhoto !== originalPhoto },
          description: { original: originalDescription, new: trimmedDescription, changed: trimmedDescription !== originalDescription }
        });

        // 如果沒有任何欄位變更，顯示提示
        if (Object.keys(dataToSubmit).length === 0) {
          setError('沒有任何欄位被修改');
          setIsLoading(false);
          return;
        }
      } else {
        // 對於新建操作，添加所有有值的欄位
        if (formData.semester && formData.semester.trim()) {
          dataToSubmit.semester = formData.semester.trim();
        }
        if (formData.date) {
          dataToSubmit.date = formData.date;
        }
        if (formData.photo && formData.photo.trim()) {
          dataToSubmit.photo = formData.photo.trim();
        }
        if (formData.description && formData.description.trim() && formData.description !== '無訪視筆記') {
          dataToSubmit.description = formData.description.trim();
        }

        // location_id 和 account_id 對新建是必須的
        dataToSubmit.location_id = parseInt(formData.location_id);
        dataToSubmit.account_id = parseInt(formData.account_id);
      }

      console.log('提交的數據:', JSON.stringify(dataToSubmit, null, 2));

      let result;
      if (record && record.recordId) {
        // 更新現有記錄
        console.log('更新記錄 ID:', record.recordId);
        result = await updateRecord(record.recordId, dataToSubmit);
        console.log('記錄更新成功:', result);
      } else {
        // 創建新記錄
        result = await createRecord(dataToSubmit);
        console.log('記錄創建成功:', result);
      }

      if (onRecordSaved) {
        onRecordSaved(result);
      }
      onClose();
    } catch (err) {
      console.error('保存記錄時發生錯誤:', err);

      // 嘗試從錯誤對象中提取有意義的訊息
      let errorMessage = '保存記錄失敗';

      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (err.error) {
        errorMessage = err.error;
      }

      // 如果錯誤訊息仍然是個對象，轉為 JSON 字串
      if (typeof errorMessage === 'object') {
        errorMessage = JSON.stringify(errorMessage);
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 刪除記錄
  const handleDelete = async () => {
    if (!record || !record.recordId) return;

    setIsLoading(true);
    setError('');

    try {
      await deleteRecord(record.recordId);
      console.log('記錄刪除成功');

      if (onRecordDeleted) {
        onRecordDeleted(record.recordId);
      }
      onClose();
    } catch (err) {
      console.error('刪除記錄時發生錯誤:', err);
      setError(err.message || '刪除記錄失敗');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content record-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{record ? '編輯家訪記錄' : '新增家訪記錄'}</h2>
          <button className="close-button" onClick={onClose} disabled={isLoading}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="record-form">
          <div className="form-group">
            <label htmlFor="semester">
              學期 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              placeholder="例如: 113-1"
              disabled={isLoading}
              required
            />
            <small className="form-hint">格式：學年-季節 (例如: 24S)</small>
          </div>

          <div className="form-group">
            <label htmlFor="date">
              日期 <span className="required">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">訪視筆記</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="記錄這次家訪的內容..."
              rows="6"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="photo">照片連結</label>
            <input
              type="url"
              id="photo"
              name="photo"
              value={formData.photo}
              onChange={handleInputChange}
              placeholder="https://drive.google.com/..."
              disabled={isLoading}
            />
            <small className="form-hint">支援 Google Drive 連結</small>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="form-actions">
            {record && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                <i className="fas fa-trash"></i>
                刪除記錄
              </button>
            )}
            <div className="form-actions-right">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {record ? '更新中...' : '創建中...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    {record ? '更新記錄' : '創建記錄'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 刪除確認對話框 */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-dialog">
              <h3>確認刪除</h3>
              <p>確定要刪除這筆家訪記錄嗎？此操作無法復原。</p>
              <div className="delete-confirm-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  取消
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? '刪除中...' : '確認刪除'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordFormModal;
