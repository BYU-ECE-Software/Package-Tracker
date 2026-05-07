type SubmitFilePayload = {
  link: string;
};

type GetSampleFileResponse = {
  data: SampleFile[];
};

type SampleFile = {
  id: number;
  link: string;
  createdAt: string;
  updatedAt: string;
};

type UpdateFilePayload = {
  link: string;
};

// -------- Upload File to MinIO --------
export async function uploadSampleImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('link', file);

  const res = await fetch('/api/minio/sample-images', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to upload sample image');
  }

  const json = await res.json();
  return json.link;
}

// -------- Create New File row in DB  --------
export async function submitFile(data: SubmitFilePayload) {
  const res = await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to submit file');
  return res.json();
}

// -------- Return all rows in the files table  --------
export async function getFiles(): Promise<GetSampleFileResponse> {
  const res = await fetch(`/api/files`);
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
}

// -------- Update a file row in the db (also cleans up old MinIO object) --------
export async function updateFile(id: number, data: UpdateFilePayload): Promise<SampleFile> {
  const res = await fetch(`/api/files/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update file');
  const json = await res.json();
  return json.file;
}

// -------- Delete a file row from the db and remove the object from MinIO --------
export async function deleteFile(id: number): Promise<SampleFile> {
  const res = await fetch(`/api/files/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete file');
  const json = await res.json();
  return json.file;
}
