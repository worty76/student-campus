interface FileMeta {
  url: string;
  filename: string;
  mimetype: string;
  filetype: string;
}

interface FileMeta2 {
  url: string;
  name: string;
  type: string;
}
interface FileMeta3 {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface FileWrapper {
  file: FileMeta | FileMeta2 | FileMeta3;
}

export default async function downloadFileFromObject(fileObj: FileWrapper): Promise<void> {
  const { file } = fileObj;

  // Chuẩn hóa dữ liệu
  const url = file.url;
  const filename = 'filename' in file ? file.filename : file.name;
  const filetype = 'filetype' in file ? file.filetype : file.type.split('/').pop() || 'unknown';

  if (!url || !filename || !filetype) {
    console.warn('Thiếu thông tin file');
    return;
  }

  try {
    console.log(url)
    const response = await fetch(url);
    if (!response.ok) throw new Error('Không thể tải file');

    const blob = await response.blob();
    const downloadFilename = `${filename}.${filetype.toLowerCase()}`;

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
