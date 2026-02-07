// Vercel Serverless Function - 保存产品数据到GitHub
export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { products, token } = req.body;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: 'Invalid products data' });
  }

  if (!token) {
    return res.status(401).json({ error: 'GitHub token required' });
  }

  const GITHUB_OWNER = process.env.GITHUB_OWNER || 'okbricks';
  const GITHUB_REPO = process.env.GITHUB_REPO || 'product-catalog';
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
  const FILE_PATH = 'data/products.json';

  try {
    // 1. 获取当前文件SHA（用于更新）
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

    // 2. 准备文件内容
    const content = JSON.stringify(products, null, 2);
    const encodedContent = Buffer.from(content).toString('base64');

    // 3. 创建或更新文件
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update products: ${new Date().toISOString()}`,
          content: encodedContent,
          sha: sha, // 如果文件存在，需要提供SHA
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error('GitHub API error:', error);
      return res.status(updateResponse.status).json({ 
        error: 'Failed to update file',
        details: error.message || 'Unknown error'
      });
    }

    const result = await updateResponse.json();
    return res.status(200).json({ 
      success: true,
      message: 'Products saved successfully',
      commit: result.commit
    });

  } catch (error) {
    console.error('Error saving products:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
