import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  UploadCloud,
  Image as ImageIcon,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Edit3,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  uploadPropertyImages,
  updatePropertyImageMetadata,
  reorderPropertyImages,
  setPropertyCoverImage,
  deletePropertyImage,
} from '../../services/adminPropertyService';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_PER_UPLOAD = 10;

export default function PropertyImageManager({
  propertyId,
  initialImages = [],
  onImagesChange,
}) {
  const { getToken } = useAuth();
  const fileInputRef = useRef(null);

  // Saved images from DB
  const [images, setImages] = useState(initialImages);
  // Staged local files before uploading to Cloudinary
  const [stagedFiles, setStagedFiles] = useState([]);
  const [isDraggingOverDropzone, setIsDraggingOverDropzone] = useState(false);

  // Reordering state
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Action loading states
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [activeImageActionId, setActiveImageActionId] = useState(null);

  // Metadata editing state per image ID
  const [editingImageId, setEditingImageId] = useState(null);
  const [metadataDraft, setMetadataDraft] = useState({ caption: '', alt_text: '' });

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Feedback banners
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    setImages(initialImages || []);
    setHasUnsavedOrder(false);
  }, [initialImages]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      stagedFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [stagedFiles]);

  const syncUpdatedImages = (updatedList, message = null) => {
    setImages(updatedList);
    setHasUnsavedOrder(false);
    if (onImagesChange) {
      onImagesChange(updatedList);
    }
    if (message) {
      setSuccessMessage(message);
    }
  };

  // Validate and stage selected files
  const handleSelectFiles = (fileList) => {
    setError(null);
    setSuccessMessage(null);

    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    if (stagedFiles.length + incoming.length > MAX_FILES_PER_UPLOAD) {
      setError(`You can upload up to ${MAX_FILES_PER_UPLOAD} images at a time.`);
      return;
    }

    const validItems = [];
    for (const file of incoming) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setError(
          `Unsupported file "${file.name}". Allowed formats: JPEG, PNG, WEBP, AVIF.`
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(
          `File "${file.name}" exceeds the 10 MB size limit (${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB).`
        );
        return;
      }
      validItems.push({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        previewUrl: URL.createObjectURL(file),
        caption: '',
        alt_text: '',
      });
    }

    setStagedFiles((prev) => [...prev, ...validItems]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveStagedFile = (stagedId) => {
    setStagedFiles((prev) => {
      const target = prev.find((item) => item.id === stagedId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== stagedId);
    });
  };

  const handleStagedMetaChange = (stagedId, field, value) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === stagedId ? { ...item, [field]: value } : item))
    );
  };

  // Upload staged files to POST /api/admin/properties/:propertyId/images
  const handleUploadStaged = async () => {
    if (stagedFiles.length === 0 || uploading) return;

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      const formData = new FormData();

      const captions = [];
      const altTexts = [];

      stagedFiles.forEach((item) => {
        formData.append('images', item.file);
        captions.push(item.caption.trim());
        altTexts.push(item.alt_text.trim());
      });

      formData.append('captions', JSON.stringify(captions));
      formData.append('alt_texts', JSON.stringify(altTexts));

      const res = await uploadPropertyImages(token, propertyId, formData);

      // Revoke preview URLs and clear staging queue
      stagedFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setStagedFiles([]);

      if (res.data?.images) {
        syncUpdatedImages(
          res.data.images,
          res.message || `${stagedFiles.length} image(s) uploaded to Cloudinary.`
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Set cover image via PATCH /api/admin/properties/:propertyId/images/:imageId/cover
  const handleSetCover = async (imageId) => {
    setActiveImageActionId(imageId);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      const res = await setPropertyCoverImage(token, propertyId, imageId);
      if (res.data?.images) {
        syncUpdatedImages(res.data.images, 'Cover image updated.');
      }
    } catch (err) {
      setError(err.message || 'Failed to set cover image.');
    } finally {
      setActiveImageActionId(null);
    }
  };

  // Start editing metadata (caption / alt_text)
  const handleStartEditMetadata = (img) => {
    setEditingImageId(img.id);
    setMetadataDraft({
      caption: img.caption || '',
      alt_text: img.alt_text || '',
    });
    setConfirmDeleteId(null);
  };

  // Save metadata via PATCH /api/admin/properties/:propertyId/images/:imageId
  const handleSaveMetadata = async (imageId) => {
    setActiveImageActionId(imageId);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      const res = await updatePropertyImageMetadata(token, propertyId, imageId, {
        caption: metadataDraft.caption.trim() || null,
        alt_text: metadataDraft.alt_text.trim() || null,
      });

      setEditingImageId(null);
      if (res.data?.images) {
        syncUpdatedImages(res.data.images, 'Image caption and alt text saved.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update image metadata.');
    } finally {
      setActiveImageActionId(null);
    }
  };

  // Delete image via DELETE /api/admin/properties/:propertyId/images/:imageId
  const handleConfirmDelete = async (imageId) => {
    setActiveImageActionId(imageId);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      const res = await deletePropertyImage(token, propertyId, imageId);
      setConfirmDeleteId(null);

      if (res.data?.images) {
        syncUpdatedImages(
          res.data.images,
          'Image deleted from Cloudinary and database.'
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to delete image.');
    } finally {
      setActiveImageActionId(null);
    }
  };

  // Move image left/right in local array
  const handleMoveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Re-index sort_order locally starting from 1
    const reindexed = updated.map((img, idx) => ({
      ...img,
      sort_order: idx + 1,
    }));

    setImages(reindexed);
    setHasUnsavedOrder(true);
    setSuccessMessage(null);
  };

  // Drag-and-drop card handlers
  const handleCardDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleCardDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...images];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);

    const reindexed = updated.map((img, idx) => ({
      ...img,
      sort_order: idx + 1,
    }));

    setDraggedIndex(index);
    setImages(reindexed);
    setHasUnsavedOrder(true);
  };

  const handleCardDragEnd = () => {
    setDraggedIndex(null);
  };

  // Persist reordered images via PATCH /api/admin/properties/:propertyId/images/reorder
  const handleSaveOrder = async () => {
    if (!hasUnsavedOrder || savingOrder) return;

    setSavingOrder(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      const orderPayload = images.map((img, idx) => ({
        id: Number(img.id),
        sort_order: idx + 1,
      }));

      const res = await reorderPropertyImages(token, propertyId, orderPayload);
      if (res.data?.images) {
        syncUpdatedImages(res.data.images, 'Gallery image sort order saved.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save image order.');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleResetOrder = () => {
    setImages(initialImages || []);
    setHasUnsavedOrder(false);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '1.5rem 1.75rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <ImageIcon size={18} style={{ color: 'var(--color-yellow-primary)' }} />
          <h2
            style={{
              fontSize: '1.08rem',
              fontWeight: '800',
              color: 'var(--color-black-heading)',
              margin: 0,
            }}
          >
            8. Property Media &amp; Cloudinary Gallery ({images.length})
          </h2>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#64748b',
          }}
        >
          JPEG, PNG, WEBP, AVIF • Max 10 MB per image
        </span>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.8rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.84rem',
            fontWeight: '600',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.8rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.84rem',
            fontWeight: '600',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontWeight: '800',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOverDropzone(true);
        }}
        onDragLeave={() => setIsDraggingOverDropzone(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOverDropzone(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleSelectFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: isDraggingOverDropzone
            ? '2px dashed var(--color-brand-yellow)'
            : '2px dashed #cbd5e1',
          backgroundColor: isDraggingOverDropzone
            ? 'rgba(249, 179, 24, 0.12)'
            : '#f8fafc',
          borderRadius: '10px',
          padding: '1.75rem 1.25rem',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          marginBottom: '1.25rem',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
          onChange={(e) => handleSelectFiles(e.target.files)}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(249, 179, 24, 0.18)',
            color: 'var(--color-brand-navy)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.65rem',
          }}
        >
          <UploadCloud size={22} />
        </div>

        <div
          style={{
            fontSize: '0.92rem',
            fontWeight: '800',
            color: 'var(--color-black-heading)',
            marginBottom: '0.25rem',
          }}
        >
          Click to select images or drag &amp; drop here
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Upload up to 10 high-resolution property photos at once. The first uploaded image
          is automatically set as Cover if none exists.
        </div>
      </div>

      {/* Staged Files Queue (Pre-Upload Preview) */}
      {stagedFiles.length > 0 && (
        <div
          style={{
            backgroundColor: '#fefaf2',
            border: '1px solid rgba(249, 179, 24, 0.35)',
            borderRadius: '8px',
            padding: '1.15rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  color: '#855302',
                }}
              >
                Ready to Upload ({stagedFiles.length}{' '}
                {stagedFiles.length === 1 ? 'file' : 'files'} staged)
              </div>
              <div style={{ fontSize: '0.76rem', color: '#855302' }}>
                Add optional captions or alt text below before uploading to Cloudinary.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  stagedFiles.forEach((item) => {
                    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                  });
                  setStagedFiles([]);
                }}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(249, 179, 24, 0.4)',
                  backgroundColor: '#ffffff',
                  color: '#825a05',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                Clear Queue
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={handleUploadStaged}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--color-brand-navy)',
                  color: 'var(--color-brand-yellow)',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={15}
                      style={{ animation: 'spin 1s linear infinite' }}
                    />
                    Uploading to Cloudinary...
                  </>
                ) : (
                  <>
                    <UploadCloud size={15} />
                    Upload {stagedFiles.length}{' '}
                    {stagedFiles.length === 1 ? 'Image' : 'Images'}
                  </>
                )}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {stagedFiles.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(249, 179, 24, 0.35)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', height: '130px', backgroundColor: '#0f172a' }}>
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => handleRemoveStagedFile(item.id)}
                    title="Remove from queue"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: '700',
                      color: '#334155',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={item.file.name}
                  >
                    {item.file.name} ({(item.file.size / 1024).toFixed(0)} KB)
                  </div>
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    maxLength={255}
                    value={item.caption}
                    onChange={(e) =>
                      handleStagedMetaChange(item.id, 'caption', e.target.value)
                    }
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '0.38rem 0.55rem',
                      fontSize: '0.76rem',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Alt text for SEO (optional)"
                    maxLength={255}
                    value={item.alt_text}
                    onChange={(e) =>
                      handleStagedMetaChange(item.id, 'alt_text', e.target.value)
                    }
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '0.38rem 0.55rem',
                      fontSize: '0.76rem',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unsaved Reorder Bar */}
      {hasUnsavedOrder && (
        <div
          style={{
            backgroundColor: 'var(--color-brand-navy)',
            color: '#ffffff',
            padding: '0.85rem 1.15rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.84rem', fontWeight: '700' }}>
            <GripVertical size={16} style={{ color: 'var(--color-yellow-primary)' }} />
            <span>Gallery order has been modified. Save the new sort order to persist changes.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <button
              type="button"
              onClick={handleResetOrder}
              disabled={savingOrder}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #334155',
                backgroundColor: 'transparent',
                color: '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: savingOrder ? 'not-allowed' : 'pointer',
              }}
            >
              <RotateCcw size={13} /> Reset
            </button>

            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={savingOrder}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--color-yellow-primary)',
                color: 'var(--color-brand-near-black)',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: savingOrder ? 'not-allowed' : 'pointer',
              }}
            >
              {savingOrder ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving Order...
                </>
              ) : (
                <>
                  <Save size={14} /> Save New Order
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Existing Uploaded Images Grid */}
      {images.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            fontSize: '0.86rem',
          }}
        >
          No images uploaded for this property yet. Upload photos above to populate the gallery.
        </div>
      ) : (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              fontSize: '0.78rem',
              color: '#64748b',
              fontWeight: '600',
            }}
          >
            <span>Drag cards or use arrow buttons to reorder gallery sequence.</span>
            <span>Total Uploaded: {images.length}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.1rem',
            }}
          >
            {images.map((img, index) => {
              const isCover = Boolean(img.is_cover);
              const isBusy = activeImageActionId === img.id;
              const isEditing = editingImageId === img.id;
              const isConfirmingDelete = confirmDeleteId === img.id;

              return (
                <div
                  key={img.id}
                  draggable={!isEditing && !isConfirmingDelete && !isBusy}
                  onDragStart={() => handleCardDragStart(index)}
                  onDragOver={(e) => handleCardDragOver(e, index)}
                  onDragEnd={handleCardDragEnd}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: isCover
                      ? '2px solid var(--color-yellow-primary)'
                      : '1px solid var(--color-border)',
                    boxShadow: isCover
                      ? '0 4px 14px rgba(249, 179, 24, 0.25)'
                      : 'var(--shadow-sm)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: draggedIndex === index ? 0.55 : 1,
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                >
                  {/* Image Preview Box */}
                  <div
                    style={{
                      position: 'relative',
                      height: '165px',
                      backgroundColor: '#0f172a',
                    }}
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text || img.caption || `Property image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />

                    {/* Top Left: Cover Badge or Sort Order Pill */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: 'rgba(10, 13, 20, 0.82)',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        #{index + 1}
                      </span>

                      {isCover && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            backgroundColor: 'var(--color-yellow-primary)',
                            color: '#0B0D12',
                            fontSize: '0.7rem',
                            fontWeight: '900',
                            padding: '0.22rem 0.55rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                          }}
                        >
                          <Star size={11} fill="#0B0D12" /> Cover
                        </span>
                      )}
                    </div>

                    {/* Top Right: Reorder Left / Right Controls */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        display: 'flex',
                        gap: '0.25rem',
                      }}
                    >
                      <button
                        type="button"
                        disabled={index === 0 || isBusy}
                        onClick={() => handleMoveImage(index, -1)}
                        title="Move Earlier"
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: 'rgba(10, 13, 20, 0.8)',
                          color: index === 0 ? '#64748b' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ArrowLeft size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1 || isBusy}
                        onClick={() => handleMoveImage(index, 1)}
                        title="Move Later"
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: 'rgba(10, 13, 20, 0.8)',
                          color: index === images.length - 1 ? '#64748b' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: index === images.length - 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    {/* Dimensions Pill */}
                    {img.width_px && img.height_px && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          backgroundColor: 'rgba(10, 13, 20, 0.72)',
                          color: '#e2e8f0',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          padding: '0.12rem 0.4rem',
                          borderRadius: '3px',
                        }}
                      >
                        {img.width_px}×{img.height_px}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div
                    style={{
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                      gap: '0.75rem',
                    }}
                  >
                    {/* Metadata Display or Inline Editor */}
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              color: '#475569',
                              marginBottom: '0.2rem',
                            }}
                          >
                            Caption
                          </label>
                          <input
                            type="text"
                            maxLength={255}
                            value={metadataDraft.caption}
                            onChange={(e) =>
                              setMetadataDraft((prev) => ({
                                ...prev,
                                caption: e.target.value,
                              }))
                            }
                            placeholder="e.g. Grand Double-Height Living Room"
                            style={{
                              width: '100%',
                              padding: '0.4rem 0.55rem',
                              fontSize: '0.78rem',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              color: '#475569',
                              marginBottom: '0.2rem',
                            }}
                          >
                            Alt Text (Accessibility &amp; SEO)
                          </label>
                          <input
                            type="text"
                            maxLength={255}
                            value={metadataDraft.alt_text}
                            onChange={(e) =>
                              setMetadataDraft((prev) => ({
                                ...prev,
                                alt_text: e.target.value,
                              }))
                            }
                            placeholder="e.g. Interior view of living room at Dgate Aurelia"
                            style={{
                              width: '100%',
                              padding: '0.4rem 0.55rem',
                              fontSize: '0.78rem',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.25rem' }}>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleSaveMetadata(img.id)}
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              padding: '0.4rem 0.6rem',
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: isBusy ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <Check size={13} /> Save
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setEditingImageId(null)}
                            style={{
                              padding: '0.4rem 0.6rem',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                        <div
                          style={{
                            fontWeight: '700',
                            color: img.caption ? 'var(--color-black-heading)' : '#94a3b8',
                            marginBottom: '0.2rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={img.caption || 'No caption set'}
                        >
                          {img.caption || 'No caption set'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: img.alt_text ? '#64748b' : '#cbd5e1',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={img.alt_text || 'No alt text'}
                        >
                          Alt: {img.alt_text || '—'}
                        </div>
                      </div>
                    )}

                    {/* Action Bar or Delete Confirmation */}
                    {isConfirmingDelete ? (
                      <div
                        style={{
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          padding: '0.55rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.73rem',
                            fontWeight: '700',
                            color: '#991b1b',
                            textAlign: 'center',
                          }}
                        >
                          Delete permanently from Cloudinary?
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleConfirmDelete(img.id)}
                            style={{
                              flex: 1,
                              padding: '0.35rem 0.5rem',
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.73rem',
                              fontWeight: '800',
                              cursor: isBusy ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {isBusy ? 'Deleting...' : 'Yes, Delete'}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setConfirmDeleteId(null)}
                            style={{
                              padding: '0.35rem 0.55rem',
                              backgroundColor: '#ffffff',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              fontSize: '0.73rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      !isEditing && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.4rem',
                            paddingTop: '0.55rem',
                            borderTop: '1px solid #f1f5f9',
                          }}
                        >
                          {!isCover ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleSetCover(img.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.28rem',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#f8fafc',
                                color: '#0f172a',
                                fontSize: '0.73rem',
                                fontWeight: '700',
                                cursor: isBusy ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <Star size={12} /> Set as Cover
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                color: '#855302',
                              }}
                            >
                              Primary Cover
                            </span>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleStartEditMetadata(img)}
                              title="Edit Caption & Alt Text"
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#ffffff',
                                color: '#475569',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit3 size={12} /> Edit
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                setConfirmDeleteId(img.id);
                                setEditingImageId(null);
                              }}
                              title="Delete Image"
                              style={{
                                padding: '0.35rem 0.45rem',
                                borderRadius: '4px',
                                border: '1px solid #fecaca',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
