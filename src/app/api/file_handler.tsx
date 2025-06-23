interface FileMeta {
  url: string;
  filename: string;
  mimetype: string;
  filetype: string;
}

interface FileWrapper {
  file: FileMeta;
}
export default async function downloadFileFromObject(fileObj: FileWrapper): Promise<void> {
  const { file } = fileObj;

  if (!file?.url || !file?.filename || !file?.filetype) {
    console.warn('Thiếu thông tin file');
    return;
  }

  try {
    const response = await fetch(file.url);
    if (!response.ok) throw new Error('Không thể tải file');

    const blob = await response.blob();
    const fileExtension = file.filetype.toLowerCase();
    const downloadFilename = `${file.filename}.${fileExtension}`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = downloadFilename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(a.href);
  } catch (error) {
    console.error('Lỗi khi tải file:', error);
  }
}
