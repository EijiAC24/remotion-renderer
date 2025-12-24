const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://getlate.dev/api/v1';

async function main() {
  const apiKey = process.env.LATE_API_KEY;
  const postContent = Buffer.from(process.env.POST_CONTENT_B64, 'base64').toString('utf-8');
  const platforms = JSON.parse(Buffer.from(process.env.PLATFORMS_JSON_B64, 'base64').toString('utf-8'));
  const jobId = process.env.JOB_ID;

  if (!apiKey) {
    console.error('No API key');
    process.exit(1);
  }

  if (platforms.length === 0) {
    process.exit(0);
  }

  const videoPath = path.join(__dirname, '..', 'out', 'video.mp4');
  if (!fs.existsSync(videoPath)) {
    console.error('Video not found');
    process.exit(1);
  }

  const fileSize = fs.statSync(videoPath).size;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  // Step 1: Get presigned URL
  const presignRes = await fetch(`${BASE_URL}/media/presign`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filename: `${jobId}.mp4`,
      contentType: 'video/mp4',
      size: fileSize
    })
  });

  if (!presignRes.ok) {
    console.error('Presign failed:', presignRes.status);
    process.exit(1);
  }

  const presignData = await presignRes.json();
  const uploadUrl = presignData.uploadUrl;
  const mediaUrl = presignData.publicUrl;

  // Step 2: Upload video
  const videoBuffer = fs.readFileSync(videoPath);
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4' },
    body: videoBuffer
  });

  if (!uploadRes.ok) {
    console.error('Upload failed:', uploadRes.status);
    process.exit(1);
  }

  // Step 3: Create post
  const postRes = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      content: postContent,
      status: 'published',
      platforms: platforms,
      mediaItems: [{ type: 'video', url: mediaUrl }]
    })
  });

  if (!postRes.ok) {
    console.error('Post failed:', postRes.status);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
