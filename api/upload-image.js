// Vercel Serverless Function - 上传图片到GitHub
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageData, filename, token } = req.body;

  if (!imageData || !filename || !token) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const GITHUB_OWNER = process.env.GITHUB_OWNER || 'okbricks';
  const GITHUB_REPO = process.env.GITHUB_REPO || 'product-catalog';
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
  const FILE_PATH = `images/${filename}`;

  try {
    // 检查文件是否已存在
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    let sha = null;
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
    }

    // 如果是base64 data URL，提取实际数据
    let imageContent = imageData;
    if (imageData.startsWith('data:')) {
      imageContent = imageData.split(',')[1];
    }

    // 上传文件
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload image: ${filename}`,
          content: imageContent,
          sha: sha,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      return res.status(updateResponse.status).json({ 
        error: 'Failed to upload image',
        details: error.message 
      });
    }

    const result = await updateResponse.json();
    return res.status(200).json({ 
      success: true,
      url: result.content.download_url,
      path: FILE_PATH
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
