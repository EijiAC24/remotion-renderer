const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://getlate.dev/api/v1';

async function main() {
  const apiKey = process.env.LATE_API_KEY;
  const postContent = Buffer.from(process.env.POST_CONTENT_B64, 'base64').toString('utf-8');
  const platforms = JSON.parse(Buffer.from(process.env.PLATFORMS_JSON_B64, 'base64').toString('utf-8'));
  const jobId = process.env.JOB_ID;

  console.log('=== DEBUG START ===');
  console.log('Job ID:', jobId);
  console.log('Platforms:', JSON.stringify(platforms));
  console.log('Post content length:', postContent.length);

  if (!apiKey) {
    console.log('ERROR: No API key');
    process.exit(1);
  }

  if (platforms.length === 0) {
    console.log('No platforms specified, skipping post');
    process.exit(0);
  }

  const videoPath = path.join(__dirname, '..', 'out', 'video.mp4');
  if (!fs.existsSync(videoPath)) {
    console.log('ERROR: Video not found at', videoPath);
    process.exit(1);
  }

  const fileSize = fs.statSync(videoPath).size;
  console.log('Video size:', fileSize, 'bytes');

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  // Step 1: Get presigned URL
  console.log('Step 1: Getting presigned URL...');
  const presignRes = await fetch(`${BASE_URL}/media/presign`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filename: `${jobId}.mp4`,
      contentType: 'video/mp4',
      size: fileSize
    })
  });

  console.log('Presign response status:', presignRes.status);
  if (!presignRes.ok) {
    const errText = await presignRes.text();
    console.log('Presign error:', errText);
    process.exit(1);
  }

  const presignData = await presignRes.json();
  console.log('Presign data:', JSON.stringify(presignData, null, 2));
  const uploadUrl = presignData.uploadUrl;
  const mediaUrl = presignData.publicUrl;
  console.log('Media URL:', mediaUrl);

  // Step 2: Upload video
  console.log('Step 2: Uploading video...');
  const videoBuffer = fs.readFileSync(videoPath);
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4' },
    body: videoBuffer
  });

  console.log('Upload response status:', uploadRes.status);
  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.log('Upload error:', errText);
    process.exit(1);
  }

  // Step 3: Create post
  console.log('Step 3: Creating post...');
  const postBody = {
    content: postContent,
    status: 'published',
    platforms: platforms,
    mediaItems: [
      {
        type: 'video',
        url: mediaUrl
      }
    ]
  };
  console.log('Post body:', JSON.stringify(postBody, null, 2));

  const postRes = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(postBody)
  });

  console.log('Post response status:', postRes.status);
  const postResText = await postRes.text();
  console.log('Post response:', postResText);

  if (!postRes.ok) {
    console.log('ERROR: Post creation failed');
    process.exit(1);
  }

  console.log('=== SUCCESS ===');
  process.exit(0);
}

main().catch((err) => {
  console.log('FATAL ERROR:', err.message);
  process.exit(1);
});
