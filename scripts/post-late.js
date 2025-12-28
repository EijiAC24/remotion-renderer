/**
 * Late API posting script for Trivia2
 * Posts rendered video to specified platforms via Late (getlate.dev)
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.LATE_API_URL || 'https://getlate.dev/api/v1';

async function main() {
  const apiKey = process.env.LATE_API_KEY;
  const videoPath = process.env.VIDEO_PATH || path.join(__dirname, '..', 'out', 'trivia2.mp4');
  const platformsStr = process.env.PLATFORMS || 'instagram';
  const propsPath = process.env.PROPS_PATH || path.join(__dirname, '..', 'props.json');

  console.log('=== Late API Post ===');
  console.log(`Video: ${videoPath}`);
  console.log(`Platforms: ${platformsStr}`);

  if (!apiKey) {
    console.error('ERROR: LATE_API_KEY not provided');
    process.exit(1);
  }

  // Parse platforms
  const platforms = platformsStr.split(',').map(p => p.trim()).filter(Boolean);
  if (platforms.length === 0) {
    console.log('No platforms specified, skipping');
    process.exit(0);
  }

  // Check video exists
  if (!fs.existsSync(videoPath)) {
    console.error(`ERROR: Video not found at ${videoPath}`);
    process.exit(1);
  }

  // Read props for content
  let content = '';
  let hashtags = [];
  if (fs.existsSync(propsPath)) {
    try {
      const props = JSON.parse(fs.readFileSync(propsPath, 'utf-8'));
      // Build content from props
      const words = props.words || [];
      const text = words.map(w => w.word).join('');
      const description = props.description || '';
      content = `${text}\n\n${description}`;
      hashtags = ['トリビア', '豆知識', '雑学', 'shorts', 'ショート'];
    } catch (e) {
      console.warn('Could not parse props.json:', e.message);
    }
  }

  if (!content) {
    content = 'トリビアの泉 #トリビア #豆知識 #shorts';
  }

  const fileSize = fs.statSync(videoPath).size;
  const jobId = `trivia2-${Date.now()}`;

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  console.log(`\nUploading to Late API...`);
  console.log(`File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

  try {
    // Step 1: Get presigned URL
    console.log('1. Getting presigned URL...');
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
      const errorText = await presignRes.text();
      throw new Error(`Presign failed (${presignRes.status}): ${errorText}`);
    }

    const presignData = await presignRes.json();
    const uploadUrl = presignData.uploadUrl;
    const mediaUrl = presignData.publicUrl;
    console.log(`   Media URL: ${mediaUrl}`);

    // Step 2: Upload video
    console.log('2. Uploading video...');
    const videoBuffer = fs.readFileSync(videoPath);
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: videoBuffer
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed (${uploadRes.status})`);
    }
    console.log('   Upload complete');

    // Step 3: Create post for each platform
    console.log('3. Creating posts...');

    const hashtagStr = hashtags.map(t => `#${t}`).join(' ');
    const fullContent = `${content}\n\n${hashtagStr}`;

    for (const platform of platforms) {
      console.log(`   Posting to ${platform}...`);

      const postRes = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: fullContent,
          status: 'published',
          platforms: [platform],
          mediaItems: [{ type: 'video', url: mediaUrl }]
        })
      });

      if (!postRes.ok) {
        const errorText = await postRes.text();
        console.error(`   Failed to post to ${platform}: ${errorText}`);
      } else {
        const postData = await postRes.json();
        console.log(`   ✓ ${platform}: Posted successfully`);
        if (postData.postUrl) {
          console.log(`     URL: ${postData.postUrl}`);
        }
      }
    }

    console.log('\n✓ All done!');
    process.exit(0);

  } catch (error) {
    console.error('\nERROR:', error.message);
    process.exit(1);
  }
}

main();
